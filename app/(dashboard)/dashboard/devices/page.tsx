"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Smartphone, 
  ShieldCheck, 
  FileText, 
  ArrowRightLeft, 
  Printer, 
  AlertTriangle,
  Clock,
  Sparkles
} from "lucide-react";
import RegisterDeviceModal from "@/components/owner/RegisterDeviceModal";
import StolenDocketModal from "@/components/owner/StolenDocketModal";
import TransferDeedModal from "@/components/owner/TransferDeedModal";
import { formatImei, formatDateTime } from "@/lib/utils/formatters";

export interface DeviceItem {
  id: string;
  brand: string;
  model: string;
  imei_primary: string;
  imei_secondary?: string;
  serial_number?: string;
  status: string;
  stolen_at?: string;
  theft_reference?: string;
  purchase_receipt_url?: string;
  created_at: string;
  updated_at: string;
}

const INITIAL_MOCK_DEVICES: DeviceItem[] = [
  {
    id: "dev-001",
    brand: "Apple",
    model: "iPhone 15 Pro",
    imei_primary: "358742091234567",
    serial_number: "F2LLN0G9XXXX",
    status: "CLEAN",
    purchase_receipt_url: "https://storage.rupalshield.io/receipts/apple_store_0912.pdf",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dev-002",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    imei_primary: "862345041234568",
    serial_number: "R5CW20XXXXX",
    status: "STOLEN",
    stolen_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    theft_reference: "RS-CRIME-SAM-901",
    purchase_receipt_url: "https://storage.rupalshield.io/receipts/bestbuy_s24.pdf",
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>(INITIAL_MOCK_DEVICES);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeDocketDevice, setActiveDocketDevice] = useState<any | null>(null);
  const [activeTransferDevice, setActiveTransferDevice] = useState<any | null>(null);

  // Toggle Stolen Status
  const handleToggleStolen = async (device: any) => {
    const isCurrentlyStolen = device.status === "STOLEN";
    const nextStatus = isCurrentlyStolen ? "CLEAN" : "STOLEN";
    const theftTime = nextStatus === "STOLEN" ? new Date().toISOString() : undefined;
    const ref = nextStatus === "STOLEN" ? `RS-CRIME-${device.id.slice(0, 8).toUpperCase()}` : undefined;

    const updated = devices.map((d) =>
      d.id === device.id
        ? { ...d, status: nextStatus, stolen_at: theftTime, theft_reference: ref }
        : d
    );
    setDevices(updated);

    if (nextStatus === "STOLEN") {
      setActiveDocketDevice({
        ...device,
        status: "STOLEN",
        stolen_at: theftTime,
        theft_reference: ref,
      });
    }

    try {
      await fetch(`/api/devices/${device.id}/stolen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Local state is already updated
    }
  };

  const handleDeviceRegistered = (newDevice: any) => {
    setDevices([newDevice, ...devices]);
  };

  const handleTransferred = (deviceId: string, recipient: string) => {
    setDevices(
      devices.map((d) => (d.id === deviceId ? { ...d, status: "TRANSFERRED" } : d))
    );
    alert(`Deed transferred to ${recipient}.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border-zinc-700/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-zinc-300" />
            Device Ownership Registry
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Cryptographically anchored hardware deeds & instant theft broadcast engine.
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

      {/* Device List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const isStolen = device.status === "STOLEN";
          const isTransferred = device.status === "TRANSFERRED";

          return (
            <div
              key={device.id}
              className={`glass-panel rounded-3xl p-6 transition-all duration-200 border ${
                isStolen
                  ? "border-amber-500/40 shadow-lg shadow-amber-500/5"
                  : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {/* Card Header */}
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

              {/* Specs */}
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-2 text-zinc-400 mb-5">
                <div className="flex justify-between">
                  <span>Primary IMEI:</span>
                  <span className="text-white font-mono tracking-wider">{formatImei(device.imei_primary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serial Number:</span>
                  <span className="text-zinc-300 font-mono">{device.serial_number || "N/A"}</span>
                </div>
                <div className="flex justify-between text-[10px] pt-1 border-t border-zinc-800/60">
                  <span>Registered:</span>
                  <span className="text-zinc-400">{formatDateTime(device.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 text-xs">
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
          );
        })}
      </div>

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
    </div>
  );
}
