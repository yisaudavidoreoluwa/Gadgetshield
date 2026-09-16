"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Smartphone, 
  ShieldAlert, 
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

// Default preloaded mock devices so user can immediately interact
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

    // Update in local state
    const updated = devices.map((d) =>
      d.id === device.id
        ? { ...d, status: nextStatus, stolen_at: theftTime, theft_reference: ref }
        : d
    );
    setDevices(updated);

    // If marked stolen, immediately trigger the police clearance docket modal
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
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Ownership Registry
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Cryptographically anchored hardware deeds & instant theft broadcast engine.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2.5 rounded flex items-center gap-1.5 transition"
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
              className={`p-5 rounded-xl border transition ${
                isStolen
                  ? "border-neutral-700 bg-neutral-950/80"
                  : "border-neutral-800 bg-black hover:border-neutral-700"
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                    {device.brand}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {device.model}
                  </h3>
                </div>

                {/* Status Badge */}
                <div>
                  {isStolen ? (
                    <span className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-black" />
                      FLAGGED STOLEN
                    </span>
                  ) : isTransferred ? (
                    <span className="bg-neutral-800 text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      TRANSFERRED
                    </span>
                  ) : (
                    <span className="border border-neutral-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      CLEAN DEED
                    </span>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="bg-neutral-950 border border-neutral-900 rounded p-3 text-xs space-y-1 text-neutral-400 mb-4">
                <div className="flex justify-between">
                  <span>Primary IMEI:</span>
                  <span className="text-white font-mono">{formatImei(device.imei_primary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serial Number:</span>
                  <span className="text-neutral-300 font-mono">{device.serial_number || "N/A"}</span>
                </div>
                <div className="flex justify-between text-[10px] pt-1 border-t border-neutral-900">
                  <span>Registered:</span>
                  <span className="text-neutral-500">{formatDateTime(device.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {/* View Deed */}
                <Link
                  href={`/dashboard/devices/${device.id}/deed`}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-center py-2 px-3 rounded border border-neutral-800 transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Deed
                </Link>

                {/* Transfer */}
                {!isStolen && !isTransferred && (
                  <button
                    onClick={() => setActiveTransferDevice(device)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 py-2 px-3 rounded border border-neutral-800 transition"
                    title="Transfer Ownership Deed"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Stolen Clearance Docket */}
                {isStolen && (
                  <button
                    onClick={() => setActiveDocketDevice(device)}
                    className="bg-white hover:bg-neutral-200 text-black py-2 px-3 rounded font-semibold transition flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Police Docket
                  </button>
                )}

                {/* One-Tap Report Stolen Toggle */}
                {!isTransferred && (
                  <button
                    onClick={() => handleToggleStolen(device)}
                    className={`text-xs py-2 px-3 rounded transition font-semibold flex items-center gap-1 ${
                      isStolen
                        ? "bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300"
                        : "bg-white hover:bg-neutral-200 text-black"
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
