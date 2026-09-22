"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Smartphone, 
  ShieldCheck, 
  FileText, 
  ArrowRightLeft, 
  Printer, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Inbox,
  Lock,
  Radio,
  MapPin,
  Zap
} from "lucide-react";
import RegisterDeviceModal from "@/components/owner/RegisterDeviceModal";
import StolenDocketModal from "@/components/owner/StolenDocketModal";
import TransferDeedModal from "@/components/owner/TransferDeedModal";
import TelemetryDrawer from "@/components/telemetry/TelemetryDrawer";
import DeployTrapModal from "@/components/owner/DeployTrapModal";
import { formatImei, formatDateTime } from "@/lib/utils/formatters";
import { useAuth } from "@/lib/supabase/auth-context";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { Device } from "@/lib/types/database";

export default function DevicesPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeDocketDevice, setActiveDocketDevice] = useState<Device | null>(null);
  const [activeTransferDevice, setActiveTransferDevice] = useState<Device | null>(null);
  const [activeTelemetryDevice, setActiveTelemetryDevice] = useState<Device | null>(null);
  const [activeTrapDevice, setActiveTrapDevice] = useState<Device | null>(null);

  // Load devices from hybrid store and sync with live server if available
  const loadDevices = useCallback(() => {
    setIsLoadingDevices(true);
    // 1. Instant load from local hybrid store
    const local = hybridStore.getDevices();
    setDevices(local);
    setIsLoadingDevices(false);

    // 2. Background attempt to query server
    try {
      fetch("/api/devices")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.devices && Array.isArray(data.devices)) {
            const merged = hybridStore.mergeDevices(data.devices);
            setDevices(merged);
          }
        })
        .catch(() => {});
    } catch {
      // Ignore background error
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices, user]);

  // One-Tap Stolen Toggle
  const handleToggleStolen = (device: Device) => {
    const isCurrentlyStolen = device.status === "STOLEN";
    const nextStatus = isCurrentlyStolen ? "CLEAN" : "STOLEN";
    const theftTime = nextStatus === "STOLEN" ? new Date().toISOString() : undefined;
    const ref = nextStatus === "STOLEN" ? `RS-CRIME-${device.id.slice(0, 8).toUpperCase()}` : undefined;

    // 1. Update in hybrid store
    const updatedDev = hybridStore.updateDeviceStatus(device.id, nextStatus);

    // 2. Update in React state
    if (updatedDev) {
      setDevices(devices.map((d) => (d.id === device.id ? updatedDev : d)));
    } else {
      setDevices(devices.map((d) => (d.id === device.id ? { ...d, status: nextStatus } : d)));
    }

    // 3. Open docket modal if stolen
    if (nextStatus === "STOLEN") {
      setActiveDocketDevice({
        ...device,
        status: "STOLEN",
        stolen_at: theftTime,
        theft_reference: ref,
      });
    }

    // 4. Background sync to server API
    try {
      fetch(`/api/devices/${device.id}/stolen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      }).catch(() => {});
    } catch {
      // Ignore
    }
  };

  const handleDeviceRegistered = (newDevice: Device) => {
    const updated = hybridStore.getDevices();
    setDevices(updated);
  };

  const handleTransferred = (deviceId: string, recipient: string) => {
    hybridStore.transferDevice(deviceId, recipient);
    setDevices(
      devices.map((d) => (d.id === deviceId ? { ...d, status: "TRANSFERRED" as const } : d))
    );
    alert(`Ownership deed successfully transferred to ${recipient}.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border-zinc-700/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-zinc-300" />
            Device Ownership Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cryptographically anchored hardware deeds & instant police theft clearance engine.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Register New Device
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoadingDevices ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
          <span className="text-xs text-zinc-400 font-mono">Loading hardware deeds...</span>
        </div>
      ) : devices.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xl border-zinc-800/80">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shadow-inner">
            <Inbox className="w-8 h-8 text-zinc-500" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-semibold text-white">No Devices Registered Yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Register your phone, tablet, or laptop to generate an immutable digital deed and gain one-tap police clearance protection.
            </p>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="mt-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Register Your First Gadget
          </button>
        </div>
      ) : (
        /* Device List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => {
            const isStolen = device.status === "STOLEN";
            const isTransferred = device.status === "TRANSFERRED";

            return (
              <div
                key={device.id}
                className={`glass-panel rounded-3xl p-6 transition-all duration-200 border flex flex-col justify-between ${
                  isStolen
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/5 bg-amber-950/10"
                    : "border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-mono">
                        {device.brand}
                      </span>
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {device.model}
                      </h3>
                    </div>

                    {/* Status Pill Badge */}
                    <div>
                      {isStolen ? (
                        <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 font-mono">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          FLAGGED STOLEN
                        </span>
                      ) : isTransferred ? (
                        <span className="bg-zinc-800 text-zinc-300 text-[10px] font-medium px-2.5 py-1 rounded-full uppercase font-mono">
                          TRANSFERRED
                        </span>
                      ) : (
                        <span className="bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          CLEAN DEED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specs Card */}
                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-2 text-zinc-400 mb-4">
                    <div className="flex justify-between">
                      <span>Primary IMEI:</span>
                      <span className="text-white font-mono tracking-wider">{formatImei(device.imei_primary)}</span>
                    </div>
                    {device.imei_secondary && (
                      <div className="flex justify-between">
                        <span>Secondary IMEI:</span>
                        <span className="text-zinc-300 font-mono">{formatImei(device.imei_secondary)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Serial Number:</span>
                      <span className="text-zinc-300 font-mono">{device.serial_number || "N/A"}</span>
                    </div>

                    {/* Telemetry Radar Badge */}
                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-zinc-300 truncate max-w-[200px] sm:max-w-[240px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{device.last_seen_location || "Lagos, Nigeria (Active PWA Session)"}</span>
                      </div>

                      <button
                        onClick={() => setActiveTelemetryDevice(device)}
                        className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 transition shrink-0"
                      >
                        <Radio className="w-3 h-3 animate-pulse" />
                        Radar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="space-y-2 pt-1 text-xs">
                  {/* Stolen Specific Emergency Covert Trap Action */}
                  {isStolen && (
                    <button
                      onClick={() => setActiveTrapDevice(device)}
                      className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white py-2 px-3 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Deploy Recovery Trap (Bait Thief)
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    {/* View Deed */}
                    <Link
                      href={`/dashboard/devices/${device.id}/deed`}
                      className="flex-1 glass-pill hover:bg-zinc-800 text-white text-center py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Deed
                    </Link>

                    {/* Transfer */}
                    {!isStolen && !isTransferred && (
                      <button
                        onClick={() => setActiveTransferDevice(device)}
                        className="glass-pill hover:bg-zinc-800 text-zinc-300 py-2.5 px-3 rounded-xl transition"
                        title="Transfer Ownership Deed"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Stolen Clearance Docket */}
                    {isStolen && (
                      <button
                        onClick={() => setActiveDocketDevice(device)}
                        className="bg-white hover:bg-zinc-200 text-zinc-950 py-2.5 px-3.5 rounded-xl font-semibold transition flex items-center gap-1.5 shadow"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Police Docket
                      </button>
                    )}

                    {/* One-Tap Report Stolen Toggle */}
                    {!isTransferred && (
                      <button
                        onClick={() => handleToggleStolen(device)}
                        className={`text-xs py-2.5 px-3.5 rounded-xl transition font-semibold flex items-center gap-1.5 ${
                          isStolen
                            ? "glass-pill text-zinc-300 hover:bg-zinc-800"
                            : "bg-white hover:bg-zinc-200 text-zinc-950 shadow"
                        }`}
                      >
                        {isStolen ? "Mark Recovered" : "Report Stolen"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RegisterDeviceModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={handleDeviceRegistered}
      />

      {activeDocketDevice && (
        <StolenDocketModal
          isOpen={!!activeDocketDevice}
          onClose={() => setActiveDocketDevice(null)}
          device={activeDocketDevice}
        />
      )}

      {activeTransferDevice && (
        <TransferDeedModal
          isOpen={!!activeTransferDevice}
          onClose={() => setActiveTransferDevice(null)}
          device={activeTransferDevice}
          onTransferred={handleTransferred}
        />
      )}

      {activeTelemetryDevice && (
        <TelemetryDrawer
          isOpen={!!activeTelemetryDevice}
          onClose={() => setActiveTelemetryDevice(null)}
          device={activeTelemetryDevice}
        />
      )}

      {activeTrapDevice && (
        <DeployTrapModal
          isOpen={!!activeTrapDevice}
          onClose={() => setActiveTrapDevice(null)}
          device={activeTrapDevice}
        />
      )}
    </div>
  );
}