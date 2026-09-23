"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Radio, 
  Smartphone, 
  MapPin, 
  AlertTriangle,
  Zap,
  Globe,
  Plus,
  ShieldCheck,
  FileCheck,
  Building2,
  Award,
  Truck,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { Device, DecoyTrap, DecoyTemplate, TrapCapture } from "@/lib/types/database";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { formatDateTime, formatImei } from "@/lib/utils/formatters";

interface DeployTrapModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

export default function DeployTrapModal({
  isOpen,
  onClose,
  device,
}: DeployTrapModalProps) {
  const [traps, setTraps] = useState<DecoyTrap[]>([]);
  const [selectedNoticeType, setSelectedNoticeType] = useState<"registry_notice" | "finder_reward" | "dealer_alert">("registry_notice");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPretext, setCopiedPretext] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !device) return;
    const existingTraps = hybridStore.getDecoyTraps(device.id);
    if (existingTraps.length === 0) {
      // Auto-create initial recovery portal link if not yet generated
      const newTrap = hybridStore.createDecoyTrap(device.id, "lawful_recovery");
      setTraps([newTrap]);
    } else {
      setTraps(existingTraps);
    }
  }, [isOpen, device]);

  if (!isOpen || !device) return null;

  const handleGenerateNewLink = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newTrap = hybridStore.createDecoyTrap(device.id, "lawful_recovery");
      const updated = hybridStore.getDecoyTraps(device.id);
      setTraps(updated);
      setIsGenerating(false);
    }, 300);
  };

  const activeTrap = traps[0];
  const origin = typeof window !== "undefined" ? window.location.origin : "https://rupalshield.vercel.app";
  const recoveryUrl = activeTrap 
    ? (activeTrap.trap_url.startsWith("/recover") ? `${origin}${activeTrap.trap_url}` : `${origin}/recover/${activeTrap.id}`)
    : `${origin}/recover/${device.id}`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    } else {
      setCopiedPretext(true);
      setTimeout(() => setCopiedPretext(false), 2000);
    }
  };

  // Legitimate, non-deceptive messaging templates
  const getNoticeMessage = (type: "registry_notice" | "finder_reward" | "dealer_alert") => {
    if (type === "registry_notice") {
      return `Gadgetshield Recovery Notice: A recovery case has been opened for this ${device.brand} ${device.model} (IMEI ending in ${device.imei_primary.slice(-4)}). If you have found or are currently holding this gadget, please visit the official safe custody portal to coordinate return and claim the verified return reward: ${recoveryUrl}`;
    }
    if (type === "finder_reward") {
      return `Hello, my ${device.brand} ${device.model} was misplaced or taken. An official return reward has been pledged on the Gadgetshield National Registry. Please visit this safe custody portal to claim the reward and arrange drop-off: ${recoveryUrl}`;
    }
    return `Attention Workshop / Electronics Counter: This ${device.brand} ${device.model} is cryptographically registered to its verified owner and reported missing. Please log safe custody and issue a Clean Hands token here: ${recoveryUrl}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-zinc-700/80 shadow-2xl overflow-hidden bg-zinc-950/95">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Lawful Recovery Portal // REC-01
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Lawful Property Recovery & Custody Link
            </h2>
            <p className="text-xs text-zinc-400">
              Generate a verified, non-deceptive recovery portal link where finders or current holders can safely report custody, select an accredited drop-off center, or coordinate handover.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Hardware Summary */}
          <div className="glass-panel p-4 rounded-2xl border-zinc-700/60 flex justify-between items-center bg-zinc-900/40 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500">Flagged Missing Gadget:</span>
              <div className="font-semibold text-white text-sm">{device.brand} {device.model}</div>
              <div className="text-zinc-400 font-mono">IMEI: {formatImei(device.imei_primary)}</div>
            </div>
            <div className="text-right">
              <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase font-mono">
                RECOVERY ACTIVE
              </span>
            </div>
          </div>

          {/* Notice Tone Selector */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
              1. Select Notice Message Tone:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Registry Notice */}
              <button
                type="button"
                onClick={() => setSelectedNoticeType("registry_notice")}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                  selectedNoticeType === "registry_notice"
                    ? "bg-zinc-800 border-white text-white shadow-lg"
                    : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Official Registry Notice</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Formal national registry notification inviting voluntary handover under Clean Hands statutory protection.
                </p>
              </button>

              {/* Reward Incentive */}
              <button
                type="button"
                onClick={() => setSelectedNoticeType("finder_reward")}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                  selectedNoticeType === "finder_reward"
                    ? "bg-zinc-800 border-white text-white shadow-lg"
                    : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Finder Reward Incentive</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Friendly cooperative message emphasizing the verified return reward and safe drop-off hubs.
                </p>
              </button>

              {/* Repair Shop Alert */}
              <button
                type="button"
                onClick={() => setSelectedNoticeType("dealer_alert")}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                  selectedNoticeType === "dealer_alert"
                    ? "bg-zinc-800 border-white text-white shadow-lg"
                    : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">Electronics Counter Alert</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Directed at repair shops and technicians to log safe custody and avoid receiving hot items.
                </p>
              </button>
            </div>
          </div>

          {/* Generated Link Card */}
          <div className="glass-panel p-4 rounded-2xl border-zinc-700/60 space-y-4 bg-zinc-900/60">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-zinc-400">
                Official Lawful Recovery URL:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={recoveryUrl}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(recoveryUrl, true)}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
                <a
                  href={recoveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white"
                  title="Preview Portal in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Recommended Message Copy */}
            <div className="space-y-1.5 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-zinc-400">
                  Recommended SMS / WhatsApp Text:
                </span>
                <button
                  onClick={() => copyToClipboard(getNoticeMessage(selectedNoticeType), false)}
                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copiedPretext ? <span className="text-emerald-400 font-bold">Copied Message!</span> : "Copy Message"}
                </button>
              </div>
              <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                "{getNoticeMessage(selectedNoticeType)}"
              </p>
            </div>

            {/* Privacy Compliance Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <span className="font-semibold text-white">Zero Deception & Full Compliance:</span>
                <p className="text-zinc-400">
                  This recovery landing page is transparent and non-deceptive. Geolocation is requested only with explicit user permission when arranging drop-off or courier pickup.
                </p>
              </div>
            </div>
          </div>

          {/* Incoming Custody Reports & Handover Logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Incoming Custody Reports & Check-Ins
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {activeTrap?.captures?.length || 0} reports filed
              </span>
            </div>

            {!activeTrap || !activeTrap.captures || activeTrap.captures.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border-zinc-800 text-xs text-zinc-500 font-mono space-y-1">
                <p>No custody reports filed yet.</p>
                <p className="text-[11px] text-zinc-600">Once the finder or holder visits the link and submits a report or shares location, details will appear here immediately.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTrap.captures.map((capture: TrapCapture) => {
                  const hasGps = capture.latitude !== undefined && capture.longitude !== undefined;
                  const mapsUrl = hasGps
                    ? `https://www.google.com/maps?q=${capture.latitude},${capture.longitude}`
                    : null;

                  return (
                    <div
                      key={capture.id}
                      className="p-4 rounded-2xl glass-panel border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="font-bold text-white">
                            CUSTODY REPORT #{capture.receipt_token || capture.id.slice(-4).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {formatDateTime(capture.timestamp)}
                        </span>
                      </div>

                      {/* Circumstance & Handover preference */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                          <span className="text-zinc-500">Holder Circumstance:</span>
                          <span className="text-white capitalize">
                            {capture.holder_circumstance ? capture.holder_circumstance.replace("_", " ") : "Voluntary Surrender"}
                          </span>
                        </div>

                        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                          <span className="text-zinc-500">Handover Preference:</span>
                          <span className="text-emerald-400 capitalize">
                            {capture.handover_preference ? capture.handover_preference.replace("_", " ") : "Drop-off Hub"}
                          </span>
                        </div>

                        {capture.dropoff_location_note && (
                          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 sm:col-span-2">
                            <span className="text-zinc-500 block mb-0.5">Drop-off / Custody Note:</span>
                            <span className="text-white">{capture.dropoff_location_note}</span>
                          </div>
                        )}

                        {capture.contact_info && (
                          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 sm:col-span-2 flex items-center justify-between">
                            <span className="text-zinc-500">Holder Contact:</span>
                            <span className="text-amber-400 font-bold">{capture.contact_info}</span>
                          </div>
                        )}

                        {capture.message_to_owner && (
                          <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 sm:col-span-2">
                            <span className="text-zinc-500 block mb-0.5">Message from Holder:</span>
                            <span className="text-zinc-300 italic">"{capture.message_to_owner}"</span>
                          </div>
                        )}
                      </div>

                      {/* GPS & Map link */}
                      <div className="flex justify-between items-center pt-1 border-t border-zinc-800 text-[11px] font-mono">
                        <span className="text-zinc-400">
                          {hasGps 
                            ? `📍 Consented Coordinates: ${capture.latitude?.toFixed(4)}, ${capture.longitude?.toFixed(4)}`
                            : "📍 Coordinates: Not shared by holder"}
                        </span>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                          >
                            <MapPin className="w-3 h-3" /> View Map
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>
            Custody handovers are officially verified under statutory property restoration protocols.
          </span>
          <button
            onClick={onClose}
            className="text-xs text-zinc-300 hover:text-white px-4 py-1.5 rounded-xl glass-pill transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
