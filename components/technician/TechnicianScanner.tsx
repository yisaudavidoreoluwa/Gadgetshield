"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  CameraOff, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Printer, 
  Sparkles
} from "lucide-react";
import { validateImeiLuhn } from "@/lib/utils/luhn";
import { formatImei } from "@/lib/utils/formatters";
import DeceptiveDiagnosticCard from "./DeceptiveDiagnosticCard";

interface ScanResult {
  status: "VERIFIED_CLEAN" | "UNREGISTERED" | "FLAGGED_STOLEN";
  matchedDeviceId?: string;
  brand?: string;
  model?: string;
  cleanHandsToken: string;
  scannedAt: string;
  imei: string;
}

export default function TechnicianScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [manualImei, setManualImei] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [protocolActionTaken, setProtocolActionTaken] = useState<string | null>(null);

  // Quick test helpers
  const setDemoStolen = () => setManualImei("862345041234568");
  const setDemoClean = () => setManualImei("358742091234567");

  // Camera Management
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera access failed or unavailable:", err);
      setErrorMsg("Camera sensor unavailable. You can use manual IMEI entry below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Execution of Silent Scan
  const executeVerification = useCallback(async (imeiToVerify: string) => {
    const cleaned = imeiToVerify.replace(/[^0-9A-Za-z]/g, "");
    if (cleaned.length < 8) {
      setErrorMsg("Identifier too short for database lookup.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setProtocolActionTaken(null);

    // Grab GPS silently without customer alert
    let coordinates: { lat: number | null; lng: number | null } = { lat: null, lng: null };
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 3500,
            enableHighAccuracy: true,
          });
        });
        coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      } catch {
        // Continue silently if GPS is denied or unavailable
      }
    }

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: cleaned,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        }),
      });

      if (!response.ok) {
        throw new Error("Verification API lookup failed.");
      }

      const data = await response.json();
      setScanResult({
        status: data.status,
        matchedDeviceId: data.matched_device_id,
        brand: data.brand,
        model: data.model,
        cleanHandsToken: data.clean_hands_token,
        scannedAt: data.scanned_at,
        imei: cleaned,
      });

      stopCamera();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete device verification.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Barcode Detection Loop
  useEffect(() => {
    let animationFrameId: number;
    let isDetecting = false;

    const detectBarcode = async () => {
      if (
        cameraActive &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        typeof window !== "undefined" &&
        "BarcodeDetector" in window
      ) {
        try {
          if (!isDetecting) {
            isDetecting = true;
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ["code_128", "code_39", "ean_13", "data_matrix", "qr_code"],
            });
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              const numericOnly = raw.replace(/[^0-9]/g, "");
              if (numericOnly.length === 15 && validateImeiLuhn(numericOnly)) {
                await executeVerification(numericOnly);
                return;
              }
            }
          }
        } catch {
          // Ignore detector frame skip
        } finally {
          isDetecting = false;
        }
      }
      if (cameraActive) {
        animationFrameId = requestAnimationFrame(detectBarcode);
      }
    };

    if (cameraActive) {
      animationFrameId = requestAnimationFrame(detectBarcode);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, executeVerification]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Action Dispatcher for Deceptive Diagnostic State
  const handleProtocolAction = async (action: "INTAKE_HOLD" | "SERVICE_DECLINED") => {
    if (!scanResult) return;
    try {
      await fetch("/api/scan/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleanHandsToken: scanResult.cleanHandsToken,
          action,
        }),
      });
      setProtocolActionTaken(action);
    } catch (err) {
      console.error("Failed to log protocol action:", err);
      setProtocolActionTaken(action);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setManualImei("");
    setProtocolActionTaken(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-black text-white min-h-[calc(100vh-3.5rem)] font-mono flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <header className="border-b border-neutral-800 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-neutral-300 font-semibold">
              RupalShield // Intake Terminal
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded">
            SILENT SHIELD ENGAGED
          </span>
        </header>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs p-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Viewfinder Area */}
        {!scanResult && (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {/* Viewfinder Reticle Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-24 border border-white/40 rounded relative">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />
                    <div className="w-full h-0.5 bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)] absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                  <div className="absolute bottom-3 text-[10px] text-neutral-400 tracking-wider bg-black/80 px-2 py-0.5 rounded">
                    ALIGN BARCODE / IMEI LABEL
                  </div>
                </div>
              )}

              {/* Camera Offline Placeholder */}
              {!cameraActive && (
                <div className="flex flex-col items-center gap-2 text-neutral-500 p-6 text-center">
                  <CameraOff className="w-8 h-8 stroke-1 text-neutral-600" />
                  <span className="text-xs">Optical Sensor Standby</span>
                  <button
                    onClick={startCamera}
                    className="mt-2 text-xs bg-white text-black font-sans font-medium px-4 py-2 rounded hover:bg-neutral-200 transition"
                  >
                    Activate Camera Stream
                  </button>
                </div>
              )}
            </div>

            {/* Manual IMEI Input with Luhn Check */}
            <div className="border border-neutral-800 bg-neutral-950 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400">
                  Manual IMEI / Serial Lookup
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={setDemoStolen}
                    className="text-[10px] text-neutral-400 hover:text-white underline"
                    title="Load mock stolen IMEI for testing"
                  >
                    Load Stolen Demo
                  </button>
                  <span className="text-neutral-700">|</span>
                  <button
                    onClick={setDemoClean}
                    className="text-[10px] text-neutral-400 hover:text-white underline"
                    title="Load mock clean IMEI for testing"
                  >
                    Load Clean Demo
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={manualImei}
                  onChange={(e) => setManualImei(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="15-digit IMEI"
                  className="flex-1 bg-black border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white font-mono tracking-widest placeholder:text-neutral-600"
                />
                <button
                  disabled={isProcessing || manualImei.length < 8}
                  onClick={() => executeVerification(manualImei)}
                  className="bg-white text-black disabled:bg-neutral-800 disabled:text-neutral-500 font-sans text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Verify
                </button>
              </div>

              {/* Live Luhn Integrity Feedback */}
              {manualImei.length === 15 && (
                <div className="mt-2 text-[11px] flex items-center gap-1.5">
                  {validateImeiLuhn(manualImei) ? (
                    <span className="text-neutral-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-white" /> Valid Luhn Checksum (Mod 10 Verified)
                    </span>
                  ) : (
                    <span className="text-neutral-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-neutral-400" /> Invalid IMEI Checksum (Luhn Mismatch)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* RESULT VIEWS                                                  */}
        {/* ------------------------------------------------------------- */}

        {/* 1. STEALTH SAFETY PROTOCOL (TRIGGERED WHEN STOLEN) */}
        {scanResult && scanResult.status === "FLAGGED_STOLEN" && (
          <div className="space-y-4">
            <DeceptiveDiagnosticCard
              brand={scanResult.brand}
              model={scanResult.model}
              cleanHandsToken={scanResult.cleanHandsToken}
              onHoldDiagnostic={() => handleProtocolAction("INTAKE_HOLD")}
              onDeclineService={() => handleProtocolAction("SERVICE_DECLINED")}
              actionTaken={protocolActionTaken}
            />

            {protocolActionTaken && (
              <button
                onClick={resetScanner}
                className="w-full text-xs bg-white text-black font-sans font-medium py-2 rounded hover:bg-neutral-200 transition"
              >
                Scan Next Device
              </button>
            )}
          </div>
        )}

        {/* 2. VERIFIED CLEAN STATE */}
        {scanResult && scanResult.status === "VERIFIED_CLEAN" && (
          <div className="border border-neutral-800 bg-neutral-950 p-5 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-white" />
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Verified Clean Ownership
                </h3>
                <p className="text-[11px] text-neutral-400">Clear title confirmed in national registry.</p>
              </div>
            </div>

            <div className="bg-black border border-neutral-900 p-3.5 rounded text-xs space-y-1.5 text-neutral-400">
              <div className="flex justify-between">
                <span>Device:</span>
                <span className="text-white font-medium">{scanResult.brand} {scanResult.model}</span>
              </div>
              <div className="flex justify-between">
                <span>IMEI Primary:</span>
                <span className="text-neutral-200">{formatImei(scanResult.imei)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-white" /> CLEAN_TITLE
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-neutral-900 text-[10px]">
                <span>Audit Token:</span>
                <span className="font-mono text-neutral-400">{scanResult.cleanHandsToken.slice(0, 16)}...</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert(`Intake Claim Ticket Generated:\nDevice: ${scanResult.brand} ${scanResult.model}\nIMEI: ${scanResult.imei}\nToken: ${scanResult.cleanHandsToken}`)}
                className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs font-sans font-semibold py-2.5 rounded flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Generate Intake Claim Ticket
              </button>
              <button
                onClick={resetScanner}
                className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs px-3 rounded hover:bg-neutral-800"
              >
                New Scan
              </button>
            </div>
          </div>
        )}

        {/* 3. UNREGISTERED STATE */}
        {scanResult && scanResult.status === "UNREGISTERED" && (
          <div className="border border-neutral-800 bg-neutral-950 p-5 rounded-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Clock className="w-5 h-5 text-neutral-400" />
              <div>
                <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Unregistered Device (Safe to Service)
                </h3>
                <p className="text-[11px] text-neutral-400">No active theft record. Standard intake permitted.</p>
              </div>
            </div>

            <div className="bg-black border border-neutral-900 p-3.5 rounded text-xs space-y-1.5 text-neutral-400">
              <div className="flex justify-between">
                <span>Searched Identifier:</span>
                <span className="text-neutral-200 font-mono">{formatImei(scanResult.imei)}</span>
              </div>
              <div className="flex justify-between">
                <span>Registry Record:</span>
                <span className="text-neutral-300">NOT_FOUND</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-neutral-900 text-[10px]">
                <span>Audit Token:</span>
                <span className="font-mono text-neutral-400">{scanResult.cleanHandsToken.slice(0, 16)}...</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert(`Standard repair receipt generated for IMEI: ${scanResult.imei}`)}
                className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs font-sans font-semibold py-2.5 rounded transition"
              >
                Issue Standard Intake Receipt
              </button>
              <button
                onClick={resetScanner}
                className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs px-3 rounded hover:bg-neutral-800"
              >
                Scan Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <footer className="border-t border-neutral-900 pt-3 mt-6 text-[10px] text-neutral-500 flex justify-between">
        <span>ENCRYPTION: TLS 1.3 // SHA-256</span>
        <span>LATENCY: &lt; 35ms</span>
      </footer>
    </div>
  );
}
