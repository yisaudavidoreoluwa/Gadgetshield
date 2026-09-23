"use client";

import React, { useState, useEffect } from "react";

import { 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  Smartphone, 
  MapPin, 
  Plus,
  ShieldCheck,
  FileCheck,
  Building2,
  Award,
  Truck,
  MessageSquare,
  RefreshCw
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
  const [selectedTemplate, setSelectedTemplate] = useState<DecoyTemplate>("prize_claim");
  const [selectedNoticeType, setSelectedNoticeType] = useState<"registry_notice" | "finder_reward" | "dealer_alert">("registry_notice");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPretext, setCopiedPretext] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTrap, setGeneratedTrap] = useState<DecoyTrap | null>(null);

  useEffect(() => {
    if (!isOpen || !device) return;
    const existingTraps = hybridStore.getDecoyTraps(device.id);
    setTraps(existingTraps);
    if (existingTraps.length > 0) {
      setGeneratedTrap(existingTraps[0]);
    }
  }, [isOpen, device]);

  if (!isOpen || !device) return null;

  const handleGenerateNewLink = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newTrap = hybridStore.createDecoyTrap(device.id, selectedTemplate);
      const updated = hybridStore.getDecoyTraps(device.id);
      setTraps(updated);
      setGeneratedTrap(newTrap);
      setIsGenerating(false);
    }, 400);
  };


  const activeTrap = generatedTrap || traps[0];
  const origin = typeof window !== "undefined" ? window.location.origin : "https://gadgetshield.vercel.app";

  // Compute the correct URL: bait templates go to /bait/, recovery goes to /recover/
  const isThemedTemplate = ["prize_claim", "device_verify", "delivery_confirm"].includes(selectedTemplate);
  const deployUrl = activeTrap
    ? activeTrap.trap_url.startsWith("http")
      ? activeTrap.trap_url
      : `${origin}${activeTrap.trap_url}`
    : isThemedTemplate
    ? `${origin}/bait/${device.id}`
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

  // Message templates vary by template type
  const getBaitMessage = () => {
    if (selectedTemplate === "prize_claim") {
      return `🎁 You've won! The ${device.brand} ${device.model} in your hands has been matched to an unclaimed Gadgetshield reward. Claim your ₦50,000 prize + 1-Year Pro membership here (10-minute window): ${deployUrl}`;
    }
    if (selectedTemplate === "device_verify") {
      return `⚠ SECURITY ALERT: The ${device.brand} ${device.model} requires immediate carrier verification to prevent service suspension. Run free verification now: ${deployUrl}`;
    }
    if (selectedTemplate === "delivery_confirm") {
      return `📦 Your GIG Express package is ready for delivery. Confirm your location to dispatch the nearest rider: ${deployUrl} — Tracking: GIG-${device.imei_primary.slice(-6)}`;
    }
    // Lawful recovery templates
    if (selectedNoticeType === "finder_reward") {
      return `Hello, my ${device.brand} ${device.model} was misplaced. A verified return reward has been pledged. Please visit the safe custody portal to claim it: ${deployUrl}`;
    }
    if (selectedNoticeType === "dealer_alert") {
      return `Attention Workshop / Electronics Counter: This ${device.brand} ${device.model} is registered to its verified owner and reported missing. Log safe custody here: ${deployUrl}`;
    }
    return `Gadgetshield Recovery Notice: A recovery case has been opened for this ${device.brand} ${device.model} (IMEI ending in ${device.imei_primary.slice(-4)}). If you have found it, please visit the official custody portal: ${deployUrl}`;
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

          {/* ── Step 1: Template Picker ── */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
              1. Choose Landing Page Template:
            </label>

            {/* Bait templates */}
            <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">
              Engaging Bait Templates (high click-through, captures location automatically)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  val: "prize_claim" as const,
                  emoji: "🎁",
                  label: "Prize Claim Portal",
                  sub: "\"You've been selected!\" reward claim page with 10-min countdown.",
                  accent: "text-amber-400",
                  badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                },
                {
                  val: "device_verify" as const,
                  emoji: "🔒",
                  label: "Security Verification",
                  sub: "Carrier device security flag — urgent verification flow with progress scan.",
                  accent: "text-blue-400",
                  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                },
                {
                  val: "delivery_confirm" as const,
                  emoji: "📦",
                  label: "Delivery Confirmation",
                  sub: "GIG Express package awaiting delivery address confirmation.",
                  accent: "text-emerald-400",
                  badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                },
              ].map(({ val, emoji, label, sub, accent, badge }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedTemplate(val)}
                  className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                    selectedTemplate === val
                      ? "bg-zinc-800 border-white text-white shadow-lg"
                      : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <span className="text-xs font-bold text-white">{label}</span>
                    {selectedTemplate === val && (
                      <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge}`}>
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-tight ${selectedTemplate === val ? "text-zinc-300" : "text-zinc-500"}`}>
                    {sub}
                  </p>
                  <p className={`text-[10px] font-mono ${accent}`}>
                    Route: /bait/[id]
                  </p>
                </button>
              ))}
            </div>

            {/* Lawful recovery option */}
            <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide pt-1">
              Transparent Recovery Portal (Explicit — no location until owner consent)
            </p>
            <button
              type="button"
              onClick={() => setSelectedTemplate("lawful_recovery")}
              className={`w-full p-4 rounded-2xl text-left border transition flex items-center gap-3 ${
                selectedTemplate === "lawful_recovery"
                  ? "bg-zinc-800 border-white text-white shadow-lg"
                  : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="space-y-0.5 flex-1">
                <div className="text-xs font-bold text-white">Official Lawful Recovery Portal</div>
                <div className="text-[11px] text-zinc-400">
                  Transparent Gadgetshield custody handover page — shown openly to finders, repair shops, or police. Route: /recover/[id]
                </div>
              </div>
              {selectedTemplate === "lawful_recovery" && (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Message tone (for lawful_recovery only) */}
          {selectedTemplate === "lawful_recovery" && (
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
                1b. Select Notice Message Tone:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { val: "registry_notice" as const, icon: ShieldCheck, label: "Registry Notice", sub: "Formal registry notification.", color: "text-emerald-400" },
                  { val: "finder_reward" as const, icon: Award, label: "Finder Reward", sub: "Friendly reward incentive message.", color: "text-amber-400" },
                  { val: "dealer_alert" as const, icon: Building2, label: "Electronics Counter", sub: "Alert to repair shops.", color: "text-blue-400" },
                ].map(({ val, icon: Icon, label, sub, color }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSelectedNoticeType(val)}
                    className={`p-3 rounded-xl text-left border transition flex flex-col gap-1.5 ${
                      selectedNoticeType === val
                        ? "bg-zinc-800 border-white"
                        : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-xs font-bold text-white">{label}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight">{sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Generate ── */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
              2. Generate & Copy Link:
            </label>
            <button
              type="button"
              onClick={handleGenerateNewLink}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Link…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate New Recovery Link
                </>
              )}
            </button>
          </div>

          {/* Generated Link Card */}
          {activeTrap && (
            <div className="glass-panel p-4 rounded-2xl border-zinc-700/60 space-y-4 bg-zinc-900/60">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Generated Link ({activeTrap.template}):
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activeTrap.click_count} visits
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={deployUrl}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(deployUrl, true)}
                    className="bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedLink ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copied</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                    )}
                  </button>
                  <a
                    href={deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white"
                    title="Preview in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Message copy */}
              <div className="space-y-1.5 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    SMS / WhatsApp Message:
                  </span>
                  <button
                    onClick={() => copyToClipboard(getBaitMessage(), false)}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedPretext ? <span className="text-emerald-400 font-bold">Copied!</span> : "Copy Message"}
                  </button>
                </div>
                <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                  &quot;{getBaitMessage()}&quot;
                </p>
              </div>

              {/* Phase 2 notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <span className="font-semibold text-white">Two-Phase Recovery Flow:</span>
                  <p className="text-zinc-400">
                    After location is captured, the page automatically transitions to the authentic Gadgetshield Recovery Portal with a 24-hour voluntary handover window and Clean Hands safe harbor notice.
                  </p>
                </div>
              </div>
            </div>
          )}

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
