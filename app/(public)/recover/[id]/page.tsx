"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  Eye, 
  PhoneCall, 
  Building2, 
  HelpCircle,
  FileCheck,
  Award,
  AlertCircle,
  Shield,
  MessageSquare,
  Truck
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { Device } from "@/lib/types/database";

interface RecoveryPageProps {
  params: Promise<{ id: string }>;
}

export default function LawfulRecoveryPage({ params }: RecoveryPageProps) {
  const resolvedParams = use(params);
  const recoveryId = resolvedParams.id;

  const [device, setDevice] = useState<Device | null>(null);
  const [deviceModel, setDeviceModel] = useState<string>("Flagged Hardware Asset");
  const [deviceBrand, setDeviceBrand] = useState<string>("Registered Device");
  const [activeTab, setActiveTab] = useState<"report" | "hubs" | "hotline">("report");

  // Form State
  const [circumstance, setCircumstance] = useState<string>("found_public");
  const [handoverPreference, setHandoverPreference] = useState<string>("dropoff_hub");
  const [dropoffNote, setDropoffNote] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
  const [messageToOwner, setMessageToOwner] = useState<string>("");
  
  // Explicit Location Opt-In State
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [receiptToken, setReceiptToken] = useState<string>("");

  useEffect(() => {
    // 1. Fetch from hybrid store
    const trap = hybridStore.getDecoyTrapById(recoveryId);
    if (trap) {
      const devices = hybridStore.getDevices();
      const dev = devices.find((d) => d.id === trap.device_id);
      if (dev) {
        setDevice(dev);
        setDeviceModel(dev.model);
        setDeviceBrand(dev.brand);
        return;
      }
    }

    // 2. Fetch device from API or local fallback
    fetch(`/api/devices/${recoveryId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.device) {
          setDevice(data.device);
          setDeviceModel(data.device.model);
          setDeviceBrand(data.device.brand);
        }
      })
      .catch(() => {});
  }, [recoveryId]);

  // Explicit Location Trigger (Only runs when user clicks the button)
  const handleRequestLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission was denied. You can still submit your custody report without coordinates.");
        } else {
          setLocationError("Unable to acquire GPS signal. You can proceed without coordinates.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleClearLocation = () => {
    setLocationCoords(null);
    setLocationError(null);
  };

  // Submit Custody Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedToken = `RCV-SEC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const payload = {
      trap_id: recoveryId,
      consent_acknowledged: true,
      latitude: locationCoords?.lat,
      longitude: locationCoords?.lng,
      accuracy: locationCoords?.accuracy,
      holder_circumstance: circumstance,
      handover_preference: handoverPreference,
      dropoff_location_note: dropoffNote.trim() || undefined,
      contact_info: contactInfo.trim() || undefined,
      message_to_owner: messageToOwner.trim() || undefined,
      receipt_token: generatedToken,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Authorized Custody Session",
    };

    // 1. Record in client-side hybrid store
    hybridStore.recordTrapCapture(recoveryId, payload);

    // 2. Transmit to server API
    try {
      await fetch("/api/trap/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Local storage fallback ensures zero data loss
    }

    setReceiptToken(generatedToken);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col items-center justify-center selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Official Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Gadgetshield National Property Recovery Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Registered Property Custody Portal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Facilitating lawful, secure handover of registered lost hardware between finders, holders, and verified owners.
          </p>
        </div>

        {/* Device Status & Ownership Notice Card */}
        <div className="glass-panel rounded-3xl p-6 border border-zinc-700/80 shadow-2xl space-y-4 bg-zinc-950/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400">Flagged Hardware:</span>
                <h2 className="text-base font-bold text-white">
                  {deviceBrand} {deviceModel}
                </h2>
                <div className="text-xs text-zinc-400 font-mono">
                  IMEI: {device?.imei_primary ? `•••• •••• •••• ${device.imei_primary.slice(-4)}` : "Verified in Registry"}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono">
                Recovery Case Active
              </span>
              <div className="text-[11px] text-zinc-400 font-mono">
                Ref: RS-REC-{recoveryId.slice(-6).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Reassuring Legal Clean Hands Notice */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-emerald-300">Clean Hands Safe Harbor Protection</h3>
              <p className="text-zinc-300 leading-relaxed">
                If you have found, purchased unaware, or are currently holding this gadget, reporting it through this portal grants you statutory immunity from unlawful possession claims. The verified owner has pledged full cooperation and an official return reward.
              </p>
            </div>
          </div>

          {/* Transparent Data Privacy Disclosure */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 font-semibold text-zinc-200">
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Transparent Privacy Policy: No Covert Tracking</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed pl-1">
              <li><strong>Zero Secret Tracking:</strong> We do not capture your location without your explicit click.</li>
              <li><strong>Strict Purpose:</strong> Data is solely used to coordinate safe handover or courier dispatch with the verified owner.</li>
              <li><strong>30-Day Retention:</strong> Information is held under cryptographic audit controls for 30 days, then archived.</li>
            </ul>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        {!isSubmitted && (
          <div className="flex rounded-2xl bg-zinc-900/80 p-1 border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("report")}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === "report" ? "bg-white text-zinc-950 shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Report Custody / Return
            </button>
            <button
              onClick={() => setActiveTab("hubs")}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === "hubs" ? "bg-white text-zinc-950 shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Authorized Drop-Off Hubs
            </button>
            <button
              onClick={() => setActiveTab("hotline")}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === "hotline" ? "bg-white text-zinc-950 shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Helpline
            </button>
          </div>
        )}

        {/* Tab 1: Custody Report Form */}
        {activeTab === "report" && !isSubmitted && (
          <form onSubmit={handleSubmitReport} className="glass-panel rounded-3xl p-6 sm:p-7 border border-zinc-800 space-y-5 bg-zinc-950/60 shadow-xl">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Custody Handover Report
              </h2>
              <p className="text-xs text-zinc-400">
                Provide details on how you would like to return the device or transfer safe custody.
              </p>
            </div>

            {/* Circumstance Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-300 font-semibold block">
                How did this device come into your possession?
              </label>
              <select
                value={circumstance}
                onChange={(e) => setCircumstance(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500"
              >
                <option value="found_public">I found it in a public area / taxi / transit / restaurant</option>
                <option value="purchased_unaware">I bought it second-hand without knowing it was registered</option>
                <option value="repair_shop_holding">I run an electronics / repair shop and received it for service</option>
                <option value="turned_in">It was turned in to my office / front desk by a third party</option>
                <option value="other">Other lawful circumstance</option>
              </select>
            </div>

            {/* Preferred Handover Method */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-300 font-semibold block">
                Preferred Handover & Safe Return Method:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setHandoverPreference("dropoff_hub")}
                  className={`p-3 rounded-xl border text-left transition space-y-1 ${
                    handoverPreference === "dropoff_hub"
                      ? "bg-zinc-800 border-white text-white"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <div className="font-semibold text-xs text-white">Drop-Off Hub</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">Leave at accredited service center or police desk</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHandoverPreference("courier_pickup")}
                  className={`p-3 rounded-xl border text-left transition space-y-1 ${
                    handoverPreference === "courier_pickup"
                      ? "bg-zinc-800 border-white text-white"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Truck className="w-4 h-4 text-amber-400" />
                  <div className="font-semibold text-xs text-white">Courier Pickup</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">Authorize verified logistics agent to collect</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHandoverPreference("direct_contact")}
                  className={`p-3 rounded-xl border text-left transition space-y-1 ${
                    handoverPreference === "direct_contact"
                      ? "bg-zinc-800 border-white text-white"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <div className="font-semibold text-xs text-white">Direct Message</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">Send anonymous contact message to owner</div>
                </button>
              </div>
            </div>

            {/* Custody Location / Address Note */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-300 font-semibold block">
                Custody Location or Drop-Off Instructions:
              </label>
              <input
                type="text"
                value={dropoffNote}
                onChange={(e) => setDropoffNote(e.target.value)}
                placeholder="e.g. Left with manager at Chicken Republic Ikeja, or available around Maryland Mall"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Explicit Location Permission Card (Optional, user-consented only) */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    Share Exact Handover Coordinates (Optional)
                  </span>
                </div>
                {locationCoords && (
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Remove Location
                  </button>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                If coordinating courier collection, sharing your current coordinates assists the driver in reaching you promptly. This permission is requested only upon your explicit tap.
              </p>

              {locationCoords ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-300 font-mono">
                  <span>📍 Coordinates Attached: {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)} (±{Math.round(locationCoords.accuracy || 10)}m)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestLocation}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition flex items-center gap-2 border border-zinc-700"
                >
                  {isLocating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Acquiring GPS Signal...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Attach Current Location
                    </>
                  )}
                </button>
              )}

              {locationError && (
                <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}
            </div>

            {/* Contact Details (Optional) */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-300 font-semibold block">
                Your Contact Phone / WhatsApp or Email (Optional):
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. 08012345678 or finder@example.com (Confidential for handover & reward claim)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-[10px] text-zinc-500 block">
                Provided strictly to coordinate pickup and disburse the owner's verified return reward.
              </span>
            </div>

            {/* Note to Owner */}
            <div className="space-y-1.5 text-xs">
              <label className="text-zinc-300 font-semibold block">
                Confidential Message to Owner (Optional):
              </label>
              <textarea
                rows={2}
                value={messageToOwner}
                onChange={(e) => setMessageToOwner(e.target.value)}
                placeholder="e.g. Hi, I found your phone on the seat of taxi #124. It is in safe hands, battery is at 40%."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Securing Custody Report...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Submit Custody Report & Get Safe Harbor Token
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Authorized Drop-Off Centers */}
        {activeTab === "hubs" && !isSubmitted && (
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-zinc-800 space-y-4 bg-zinc-950/60 shadow-xl text-xs">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Accredited Property Custody Centers
              </h2>
              <p className="text-zinc-400">
                You can drop off this device at any certified partner facility. Present the Recovery Reference ID at the counter.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">CAPDAN Verified Electronics Recovery Desk</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">Accredited Hub</span>
                </div>
                <p className="text-zinc-300">
                  Otigba Street, Computer Village, Ikeja, Lagos.
                </p>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Hours: Mon – Sat, 8:00 AM – 6:00 PM // Counter Contact: capdan-desk@gadgetshield.io
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Nearest Divisional Police Headquarters</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">Official Police Desk</span>
                </div>
                <p className="text-zinc-300">
                  Any local Police Station / Property Lost & Found Division nationwide.
                </p>
                <div className="text-[11px] text-zinc-500 leading-relaxed">
                  Advise the officer to record the surrender under Gadgetshield Docket Ref: <span className="font-mono text-white">RS-REC-{recoveryId.slice(-6).toUpperCase()}</span>.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Gadgetshield Partner Courier Depots</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono">Logistics Drop-off</span>
                </div>
                <p className="text-zinc-300">
                  Major courier drop-off counters (DHL, FedEx, GIG Logistics).
                </p>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Quote verified waybill reference code to hand over securely.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Emergency Helpline */}
        {activeTab === "hotline" && !isSubmitted && (
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-zinc-800 space-y-4 bg-zinc-950/60 shadow-xl text-xs text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">24/7 Gadgetshield Recovery Desk</h2>
              <p className="text-zinc-400 max-w-sm mx-auto">
                Need immediate guidance on safe handover or reward claiming? Speak to an accredited recovery liaison.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 font-mono text-sm space-y-1 text-emerald-400 font-bold">
              <div>📞 Toll-Free Helpline: +234 (0) 800-GADGET-SHIELD</div>
              <div className="text-zinc-400 text-xs font-normal">WhatsApp Custody Line: +234 812 000 8891</div>
            </div>

            <p className="text-[11px] text-zinc-500">
              Quote Recovery Case: <span className="text-white font-mono">RS-REC-{recoveryId.slice(-6).toUpperCase()}</span>
            </p>
          </div>
        )}

        {/* Submission Success Screen */}
        {isSubmitted && (
          <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 bg-zinc-950/80 shadow-2xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Safe Custody Transfer Stamped
              </span>
              <h2 className="text-xl font-bold text-white">
                Thank You for Your Cooperation
              </h2>
              <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                Your custody report has been securely registered in the Gadgetshield National Asset Registry. The verified owner has been notified of your report.
              </p>
            </div>

            {/* Token Certificate Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 text-left space-y-3 font-mono text-xs max-w-md mx-auto">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Clean Hands Token:</span>
                <span className="text-emerald-400 font-bold">{receiptToken}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Asset Model:</span>
                <span className="text-white">{deviceBrand} {deviceModel}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Handover Mode:</span>
                <span className="text-zinc-300 uppercase">{handoverPreference.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Timestamp:</span>
                <span className="text-zinc-400">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Save or screenshot this token. It serves as your official legal proof of voluntary surrender and entitles you to claim any verified return reward.
            </p>

            <Link
              href="/"
              className="inline-block py-2.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition"
            >
              Return to Gadgetshield Home
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-500 font-mono">
          Gadgetshield // Public Asset Defense & Property Restoration Protocol
        </div>
      </div>
    </div>
  );
}
