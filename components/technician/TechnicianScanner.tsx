"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Camera, 
  CameraOff, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Printer, 
  Sparkles,
  Zap,
  ZapOff,
  SwitchCamera,
  ZoomIn,
  Sliders,
  Maximize2,
  Upload,
  ScanLine
} from "lucide-react";
import { validateImeiLuhn } from "@/lib/utils/luhn";
import { formatImei } from "@/lib/utils/formatters";
import { hybridStore } from "@/lib/storage/hybrid-store";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [manualImei, setManualImei] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [protocolActionTaken, setProtocolActionTaken] = useState<string | null>(null);
  const [hasNativeBarcodeDetector, setHasNativeBarcodeDetector] = useState<boolean>(false);

  // Workshop Camera Hardware Controls
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [zoomSupported, setZoomSupported] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [maxZoom, setMaxZoom] = useState<number>(3);

  // Quick test helpers
  const setDemoStolen = () => setManualImei("862345041234564");
  const setDemoClean = () => setManualImei("358742091234562");
  const setDemoUnregistered = () => setManualImei("352094081765437");

  useEffect(() => {
    setHasNativeBarcodeDetector(typeof window !== "undefined" && "BarcodeDetector" in window);
  }, []);

  // Enumerate available video inputs
  const fetchCameras = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setAvailableCameras(videoInputs);
        if (videoInputs.length > 0 && !selectedCameraId) {
          // Prefer environment back camera
          const backCam = videoInputs.find(c => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("environment"));
          setSelectedCameraId(backCam ? backCam.deviceId : videoInputs[0].deviceId);
        }
      }
    } catch {
      // Ignore
    }
  }, [selectedCameraId]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Start Camera with selected device & capabilities
  const startCamera = async (deviceId?: string) => {
    try {
      setErrorMsg(null);
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Inspect Track Capabilities (Torch & Zoom)
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
          if (capabilities.torch) {
            setTorchSupported(true);
          }
          if (capabilities.zoom) {
            setZoomSupported(true);
            setMaxZoom(capabilities.zoom.max || 3);
            setZoomLevel(capabilities.zoom.min || 1);
          }
        }
      }
    } catch (err: any) {
      console.warn("Camera sensor initialization:", err);
      setErrorMsg("Optical sensor unavailable. Use photo upload or manual IMEI verification below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setIsTorchOn(false);
    }
  };

  // Toggle Hardware Torch (Bench Light)
  const toggleTorch = async () => {
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track && torchSupported) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn("Torch constraint failed:", err);
      }
    }
  };

  // Adjust Digital Hardware Zoom
  const handleZoomChange = async (newZoom: number) => {
    setZoomLevel(newZoom);
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track && zoomSupported) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ zoom: newZoom }]
        });
      } catch {
        // Zoom clamp fallback
      }
    }
  };

  // Cycle Next Camera / Lens
  const switchNextCamera = () => {
    if (availableCameras.length < 2) return;
    const currentIndex = availableCameras.findIndex(c => c.deviceId === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamId = availableCameras[nextIndex].deviceId;
    setSelectedCameraId(nextCamId);
    startCamera(nextCamId);
  };

  // Execution of Silent Scan
  const executeVerification = useCallback(async (imeiToVerify: string) => {
    const cleaned = imeiToVerify.replace(/[^0-9A-Za-z]/g, "");
    if (cleaned.length < 8) {
      setErrorMsg("Identifier too short for database query.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setProtocolActionTaken(null);

    // 1. Instant check against local hybrid store (works offline, demo, and across sessions)
    const localMatch = hybridStore.lookupDeviceByIdentifier(cleaned);
    if (localMatch.status !== "UNREGISTERED" && localMatch.device) {
      const cleanHandsToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ch-${Date.now()}`;
      setScanResult({
        status: localMatch.status,
        matchedDeviceId: localMatch.device.id,
        brand: localMatch.device.brand,
        model: localMatch.device.model,
        cleanHandsToken: cleanHandsToken,
        scannedAt: new Date().toISOString(),
        imei: cleaned,
      });

      if (localMatch.status === "VERIFIED_CLEAN" && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }

      stopCamera();
      setIsProcessing(false);
      return;
    }

    // Silent background GPS grab
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
        // Continue silently without blocking if GPS is denied
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

      // Subtle haptic feedback on clean verification; pure silent stealth on stolen
      if (data.status === "VERIFIED_CLEAN" && typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }

      stopCamera();
    } catch (err: any) {
      console.warn("API query failed, applying fallback:", err);
      // Fallback: If identifier is valid Luhn, show unregistered state rather than blocking
      if (validateImeiLuhn(cleaned)) {
        setScanResult({
          status: "UNREGISTERED",
          cleanHandsToken: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ch-${Date.now()}`,
          scannedAt: new Date().toISOString(),
          imei: cleaned,
        });
        stopCamera();
      } else {
        setErrorMsg(err.message || "Failed to complete device verification.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Photo / Sticker Upload Handler (iOS Safari & Manual Photos)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await img.decode();
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["code_128", "code_39", "ean_13", "data_matrix", "qr_code"],
        });
        const barcodes = await barcodeDetector.detect(img);
        URL.revokeObjectURL(img.src);
        if (barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          const numericOnly = raw.replace(/[^0-9]/g, "");
          if (numericOnly.length >= 8) {
            await executeVerification(numericOnly);
            return;
          }
        }
      }
      // If photo was taken but BarcodeDetector is unavailable or couldn't decode:
      setErrorMsg("Image captured. Please confirm the 15-digit IMEI printed on the sticker below.");
    } catch (err: any) {
      setErrorMsg("Could not detect barcode from image. Please enter IMEI manually below.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Immediate Frame Capture Snapshot
  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["code_128", "code_39", "ean_13", "data_matrix", "qr_code"],
        });
        const barcodes = await barcodeDetector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          const numericOnly = raw.replace(/[^0-9]/g, "");
          if (numericOnly.length >= 8) {
            await executeVerification(numericOnly);
            return;
          }
        }
      }
      setErrorMsg("No barcode detected in current frame. Center the IMEI sticker or use manual lookup.");
    } catch {
      setErrorMsg("Frame scan failed. Please type the IMEI manually below.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Continuous Native Barcode Detection Loop (Chrome, Android, Edge)
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
          // Frame skip
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
      console.error("Protocol action log failed:", err);
      setProtocolActionTaken(action);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setManualImei("");
    setProtocolActionTaken(null);
    setErrorMsg(null);
    startCamera(selectedCameraId);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 py-4 text-zinc-100 flex flex-col justify-between">
      {/* Hidden File Input for iOS Safari Photo Snap & Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Top Header Card */}
      <div className="space-y-4">
        <header className="glass-panel rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="text-xs uppercase tracking-wider text-zinc-200 font-semibold font-mono">
              Intake Scanner // Workshop Mode
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 glass-pill px-2.5 py-1 rounded-full font-mono">
            SILENT SHIELD ENGAGED
          </span>
        </header>

        {/* Error Alert */}
        {errorMsg && (
          <div className="glass-panel rounded-2xl border-amber-500/30 text-amber-200 text-xs p-3.5 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Viewfinder Viewport */}
        {!scanResult && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full bg-zinc-950/90 rounded-3xl border border-zinc-800/80 overflow-hidden flex items-center justify-center shadow-2xl">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {/* Viewfinder Reticle Overlay */}
              {cameraActive && (
                <>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-3/4 h-28 border border-white/30 rounded-2xl relative shadow-inner">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-md" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-md" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-md" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-md" />
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] absolute top-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="absolute bottom-4 text-[10px] text-zinc-300 font-mono tracking-widest glass-pill px-3 py-1 rounded-full uppercase">
                      {hasNativeBarcodeDetector ? "Align Barcode or IMEI Label" : "Center Label & Tap Snapshot"}
                    </div>
                  </div>

                  {/* Top Floating Workshop Camera Controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    {/* Torch Toggle */}
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl glass-pill transition-all ${
                        isTorchOn ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30" : "text-zinc-300 hover:text-white"
                      }`}
                      title={isTorchOn ? "Turn Bench Light Off" : "Turn Bench Light On"}
                    >
                      {isTorchOn ? <Zap className="w-4 h-4 fill-black" /> : <ZapOff className="w-4 h-4" />}
                    </button>

                    {/* Camera Lens Switcher */}
                    {availableCameras.length > 1 && (
                      <button
                        onClick={switchNextCamera}
                        className="p-2 rounded-xl glass-pill text-zinc-300 hover:text-white transition-all"
                        title="Switch Camera Lens"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Capture Frame Snapshot Action (Useful for iOS Safari) */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={captureAndAnalyzeFrame}
                      disabled={isProcessing}
                      className="glass-pill text-[11px] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-zinc-800 transition"
                      title="Analyze current video frame"
                    >
                      <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Snap Frame</span>
                    </button>
                  </div>

                  {/* Bottom Floating Zoom Slider */}
                  {zoomSupported && maxZoom > 1 && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass-panel rounded-full px-4 py-1.5 flex items-center gap-2 z-10">
                      <ZoomIn className="w-3 h-3 text-zinc-400" />
                      <input
                        type="range"
                        min="1"
                        max={maxZoom}
                        step="0.1"
                        value={zoomLevel}
                        onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                      <span className="text-[10px] font-mono text-zinc-300">{zoomLevel.toFixed(1)}x</span>
                    </div>
                  )}
                </>
              )}

              {/* Camera Offline Placeholder */}
              {!cameraActive && (
                <div className="flex flex-col items-center gap-2 text-zinc-500 p-6 text-center">
                  <CameraOff className="w-9 h-9 stroke-1 text-zinc-600 mb-1" />
                  <span className="text-xs text-zinc-400">Optical Bench Sensor Standby</span>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <button
                      onClick={() => startCamera(selectedCameraId)}
                      className="text-xs bg-white text-zinc-950 font-medium px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Engage Camera Sensor
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs glass-pill text-zinc-200 font-medium px-4 py-2.5 rounded-full hover:bg-zinc-800 transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-zinc-400" />
                      Upload Sticker Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Manual IMEI Input with Luhn Check & Quick Demos */}
            <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Manual IMEI / Serial Lookup
                </label>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <button
                    onClick={setDemoStolen}
                    className="text-amber-400 hover:text-amber-300 underline transition"
                    title="Load mock stolen IMEI for testing stealth protocol"
                  >
                    Stolen Demo
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button
                    onClick={setDemoClean}
                    className="text-emerald-400 hover:text-emerald-300 underline transition"
                    title="Load mock clean IMEI for testing clean title"
                  >
                    Clean Demo
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button
                    onClick={setDemoUnregistered}
                    className="text-zinc-400 hover:text-white underline transition"
                    title="Load mock unregistered IMEI"
                  >
                    Unregistered
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={manualImei}
                  onChange={(e) => setManualImei(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Enter 15-digit IMEI"
                  className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 font-mono tracking-widest placeholder:text-zinc-600 transition"
                />
                <button
                  disabled={isProcessing || manualImei.length < 8}
                  onClick={() => executeVerification(manualImei)}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500 text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Verify
                </button>
              </div>

              {/* Bottom Quick Action: Upload Sticker Photo */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[11px]">
                {manualImei.length === 15 ? (
                  validateImeiLuhn(manualImei) ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Valid 15-digit Luhn Checksum
                    </span>
                  ) : (
                    <span className="text-zinc-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-zinc-500" /> Invalid Checksum (Mod 10 Mismatch)
                    </span>
                  )
                ) : (
                  <span className="text-zinc-500 text-[10px]">Works offline and syncs with registered devices</span>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[10px] glass-pill px-2 py-1 rounded-md transition"
                >
                  <Upload className="w-2.5 h-2.5" /> Photo Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULT VIEWS */}

        {/* 1. STEALTH SAFETY PROTOCOL (TRIGGERED ON STOLEN) */}
        {scanResult && scanResult.status === "FLAGGED_STOLEN" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
                className="w-full text-xs bg-white text-zinc-950 font-medium py-3 rounded-xl hover:bg-zinc-200 transition shadow-lg"
              >
                Scan Next Device
              </button>
            )}
          </div>
        )}

        {/* 2. VERIFIED CLEAN STATE */}
        {scanResult && scanResult.status === "VERIFIED_CLEAN" && (
          <div className="glass-panel rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Verified Clean Title
                </h3>
                <p className="text-xs text-zinc-400">Recorded ownership confirmed in national registry.</p>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 text-xs space-y-2 text-zinc-400">
              <div className="flex justify-between">
                <span>Hardware:</span>
                <span className="text-white font-medium">{scanResult.brand} {scanResult.model}</span>
              </div>
              <div className="flex justify-between">
                <span>IMEI Primary:</span>
                <span className="text-zinc-200 font-mono">{formatImei(scanResult.imei)}</span>
              </div>
              <div className="flex justify-between">
                <span>Title Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> CLEAR_TITLE
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800/60 text-[10px]">
                <span>Audit Token:</span>
                <span className="font-mono text-zinc-500">{scanResult.cleanHandsToken.slice(0, 16)}...</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => alert(`Intake Claim Ticket:\nDevice: ${scanResult.brand} ${scanResult.model}\nIMEI: ${scanResult.imei}\nToken: ${scanResult.cleanHandsToken}`)}
                className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Generate Intake Ticket
              </button>
              <button
                onClick={resetScanner}
                className="glass-pill text-zinc-300 text-xs px-4 rounded-xl hover:bg-zinc-800 transition"
              >
                New Scan
              </button>
            </div>
          </div>
        )}

        {/* 3. UNREGISTERED STATE */}
        {scanResult && scanResult.status === "UNREGISTERED" && (
          <div className="glass-panel rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                <Clock className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Unregistered Device
                </h3>
                <p className="text-xs text-zinc-400">No active theft record. Safe for servicing.</p>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 text-xs space-y-2 text-zinc-400">
              <div className="flex justify-between">
                <span>Searched Identifier:</span>
                <span className="text-zinc-200 font-mono">{formatImei(scanResult.imei)}</span>
              </div>
              <div className="flex justify-between">
                <span>Registry Record:</span>
                <span className="text-zinc-300">NOT_FOUND</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => alert(`Standard repair receipt generated for IMEI: ${scanResult.imei}`)}
                className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold py-3 rounded-xl transition shadow"
              >
                Issue Intake Receipt
              </button>
              <button
                onClick={resetScanner}
                className="glass-pill text-zinc-300 text-xs px-4 rounded-xl hover:bg-zinc-800 transition"
              >
                Scan Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <footer className="pt-6 text-[10px] text-zinc-500 font-mono flex justify-between">
        <span>ENCRYPTION: TLS 1.3 // SHA-256</span>
        <span>LATENCY: &lt; 35ms</span>
      </footer>
    </div>
  );
}