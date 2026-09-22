"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Radio, 
  Smartphone, 
  MapPin, 
  AlertTriangle,
  Zap,
  Battery,
  Globe,
  Truck,
  Plus
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
  const [selectedTemplate, setSelectedTemplate] = useState<DecoyTemplate>("icloud_alert");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPretext, setCopiedPretext] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !device) return;
    const existingTraps = hybridStore.getDecoyTraps(device.id);
    setTraps(existingTraps);
  }, [isOpen, device]);

  if (!isOpen || !device) return null;

  const handleGenerateTrap = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newTrap = hybridStore.createDecoyTrap(device.id, selectedTemplate);
      const updated = hybridStore.getDecoyTraps(device.id);
      setTraps(updated);
      setIsGenerating(false);
    }, 400);
  };

  const activeTrap = traps[0];
  const origin = typeof window !== "undefined" ? window.location.origin : "https://rupalshield.vercel.app";
  const fullTrapUrl = activeTrap ? `${origin}${activeTrap.trap_url}` : "";

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

  // Pretext message recommendations to send via SMS / WhatsApp / Telegram
  const getDeceptivePretext = (template: DecoyTemplate) => {
    if (template === "icloud_alert") {
      return `[Apple Security Alert]: A location request was initiated for your ${device.brand} ${device.model}. If this was you, confirm your identity here: ${fullTrapUrl}`;
    }
    if (template === "dhl_delivery") {
      return `DHL Express Alert: Courier was unable to complete delivery for parcel #DHL-88912 due to address mismatch. Please pin your current location here to receive package: ${fullTrapUrl}`;
    }
    return `Carrier Network Alert: Over-the-air 5G profile configuration required to keep high-speed mobile data active on this SIM. Install carrier profile: ${fullTrapUrl}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col glass-panel rounded-3xl border border-zinc-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase font-mono flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Covert Honeypot Radar // REC-01
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Deploy Forensic Recovery Trap
            </h2>
            <p className="text-xs text-zinc-400">
              Generate covert deceptive URLs that stealthily capture the thief’s precise GPS, IP, and hardware metadata upon click.
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
          {/* Device Target Card */}
          <div className="glass-panel p-4 rounded-2xl border-zinc-700/60 flex justify-between items-center bg-zinc-900/40 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500">Target Stolen Hardware:</span>
              <div className="font-semibold text-white text-sm">{device.brand} {device.model}</div>
              <div className="text-zinc-400 font-mono">IMEI: {formatImei(device.imei_primary)}</div>
            </div>
            <div className="text-right">
              <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase font-mono">
                CRIME DOCKET ACTIVE
              </span>
            </div>
          </div>

          {/* Template Chooser */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block">
              1. Select Covert Deception Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* iCloud */}
              <button
                type="button"
                onClick={() => setSelectedTemplate("icloud_alert")}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                  selectedTemplate === "icloud_alert"
                    ? "bg-zinc-800 border-white text-white shadow-lg"
                    : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold">Apple iCloud</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Disguised as an official Apple Security location confirmation prompt.
                </p>
              </button>

              {/* DHL Delivery */}
              <button
                type="button"
                onClick={() => setSelectedTemplate("dhl_delivery")}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                  selectedTemplate === "dhl_delivery"
                    ? "bg-zinc-800 border-white text-white shadow-lg"
                    : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">DHL Delivery</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Disguised as an urgent parcel drop-off address pin verification.
                </p>
              </button>

              {/* Carrier SIM */}
              <button
                type="button"
                onClick={() => setSelectedTemplate("carrier_sim")}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between space-y-2 ${
                  selectedTemplate === "carrier_sim"
                    ? "bg-zinc-800 border-white text-white shadow-lg"
                    : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Carrier Network</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Disguised as a required 5G cellular profile configuration update.
                </p>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateTrap}
                disabled={isGenerating}
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-md"
              >
                <Zap className="w-4 h-4" />
                {isGenerating ? "Synthesizing Honeypot Vector..." : "Generate New Trap URL"}
              </button>
            </div>
          </div>

          {/* Active Trap Link Box */}
          {activeTrap && (
            <div className="space-y-4 glass-panel p-5 rounded-2xl border-zinc-700 bg-zinc-900/60">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    2. Covert Honeypot Trap URL:
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Clicks Logged: {activeTrap.click_count}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullTrapUrl}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(fullTrapUrl, true)}
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
                    href={activeTrap.trap_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl glass-pill text-zinc-300 hover:text-white"
                    title="Preview Trap in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Recommended Pretext Copy */}
              <div className="space-y-1.5 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Recommended Deceptive SMS Pretext:
                  </span>
                  <button
                    onClick={() => copyToClipboard(getDeceptivePretext(selectedTemplate), false)}
                    className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    {copiedPretext ? <span className="text-emerald-400">Copied Pretext!</span> : "Copy Message"}
                  </button>
                </div>
                <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                  "{getDeceptivePretext(selectedTemplate)}"
                </p>
              </div>
            </div>
          )}

          {/* Captured Intel Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                Live Forensic Traps Intel Log
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {activeTrap?.captures?.length || 0} captures recorded
              </span>
            </div>

            {!activeTrap || !activeTrap.captures || activeTrap.captures.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border-zinc-800 text-xs text-zinc-500 font-mono">
                No thief captures recorded yet. Once the bait link is clicked, the perpetrator’s exact GPS coordinates and IP address will stream here in real time.
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
                      className="p-4 rounded-2xl glass-panel border border-red-500/30 bg-red-500/5 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                          <span className="font-bold text-white text-xs">
                            SUSPECT DEVICE CAPTURE #{capture.id.slice(-4).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {formatDateTime(capture.timestamp)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-500">GPS Coordinates:</span>
                          <span className="text-white font-bold">
                            {hasGps
                              ? `${capture.latitude?.toFixed(5)}, ${capture.longitude?.toFixed(5)}`
                              : "Pending Geolocation Pin"}
                          </span>
                        </div>
                        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-500">Perpetrator IP:</span>
                          <span className="text-amber-400 font-bold">{capture.ip_address}</span>
                        </div>
                        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-500">Battery State:</span>
                          <span className="text-zinc-300">{capture.battery_level || "Unknown"}</span>
                        </div>
                        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-500">Network Type:</span>
                          <span className="text-zinc-300">{capture.network_type || "Cellular"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 text-[10px] font-mono">
                        <span className="text-zinc-500 truncate max-w-[280px]">
                          UA: {capture.user_agent}
                        </span>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                          >
                            <MapPin className="w-3 h-3" /> View on Map
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
            Captured telemetry integrates directly into the National Police Stolen Docket.
          </span>
          <button
            onClick={onClose}
            className="text-xs text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl glass-pill transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
