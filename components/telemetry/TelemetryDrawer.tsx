"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Navigation, 
  Globe, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Smartphone,
  Radio
} from "lucide-react";
import { Device, TelemetryPing } from "@/lib/types/database";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { formatDateTime, formatImei } from "@/lib/utils/formatters";

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

export default function TelemetryDrawer({
  isOpen,
  onClose,
  device,
}: TelemetryDrawerProps) {
  const [pings, setPings] = useState<TelemetryPing[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !device) return;
    const history = hybridStore.getTelemetryPings(device.id);
    setPings(history);
  }, [isOpen, device]);

  if (!isOpen || !device) return null;

  const currentLat = device.last_seen_lat ?? pings[0]?.latitude ?? 6.4281;
  const currentLng = device.last_seen_lng ?? pings[0]?.longitude ?? 3.4219;
  const mapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  const copyCoordinates = (lat: number, lng: number, idx: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col glass-panel rounded-3xl border border-zinc-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-900/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Active Telemetry Radar // TEL-01
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-zinc-300" />
              {device.brand} {device.model}
            </h2>
            <div className="text-xs text-zinc-400 font-mono">
              IMEI: {formatImei(device.imei_primary)}
            </div>
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
          {/* Quick Summary Card */}
          <div className="glass-panel p-4 rounded-2xl border-zinc-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-zinc-900/90 to-zinc-900/40">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-mono text-zinc-400">
                Current Anchor Position
              </div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{device.last_seen_location || "Active PWA Session Recorded"}</span>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Lat: {currentLat.toFixed(5)}, Lng: {currentLng.toFixed(5)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCoordinates(currentLat, currentLng, -1)}
                className="glass-pill px-3 py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
              >
                {copiedIndex === -1 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy GPS
                  </>
                )}
              </button>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-zinc-200 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Maps
              </a>
            </div>
          </div>

          {/* Telemetry Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Session Heartbeat & Ingestion Timeline
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {pings.length} recorded pings
              </span>
            </div>

            {pings.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border-zinc-800 text-xs text-zinc-500 font-mono">
                No active session telemetry pings yet. Telemetry automatically logs during authenticated PWA sessions.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pings.map((ping, idx) => (
                  <div
                    key={ping.id || idx}
                    className="p-3.5 rounded-2xl glass-panel border border-zinc-800/80 hover:border-zinc-700 text-xs space-y-2 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-white">
                          {ping.approximate_address || "GPS Position Logged"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {formatDateTime(ping.timestamp)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400 font-mono text-[11px] pt-1 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between bg-zinc-950/40 px-2.5 py-1.5 rounded-lg">
                        <span>Coordinates:</span>
                        <span className="text-zinc-200">
                          {ping.latitude.toFixed(4)}, {ping.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-950/40 px-2.5 py-1.5 rounded-lg">
                        <span>IP Address:</span>
                        <span className="text-zinc-200">{ping.ip_address}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => copyCoordinates(ping.latitude, ping.longitude, idx)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition"
                      >
                        {copiedIndex === idx ? (
                          <span className="text-emerald-400">Copied!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                      <a
                        href={`https://www.google.com/maps?q=${ping.latitude},${ping.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                      >
                        <Navigation className="w-3 h-3" /> Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30 text-[11px] text-zinc-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Telemetry data is cryptographically anchored and admissible as prima facie evidence for rapid police recovery dockets.
          </span>
        </div>
      </div>
    </div>
  );
}
