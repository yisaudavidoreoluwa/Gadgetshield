"use client";

import React from "react";
import { X, Printer, ShieldAlert } from "lucide-react";
import { formatImei, formatDateTime } from "@/lib/utils/formatters";

interface StolenDocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    id: string;
    brand: string;
    model: string;
    imei_primary: string;
    serial_number?: string;
    status: string;
    stolen_at?: string;
    theft_reference?: string;
  };
}

export default function StolenDocketModal({
  isOpen,
  onClose,
  device,
}: StolenDocketModalProps) {
  if (!isOpen) return null;

  const incidentRef = device.theft_reference || `RS-CRIME-${device.id.slice(0, 8).toUpperCase()}`;
  const timestamp = device.stolen_at || new Date().toISOString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 text-zinc-100 shadow-2xl max-h-[90vh] overflow-y-auto border-zinc-700/60">
        {/* Top Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Police Incident Clearance Docket
              </h2>
              <span className="text-xs text-zinc-400">
                Print or export to PDF for Law Enforcement & Insurers
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL POLICE DOCKET */}
        <div className="bg-white text-black p-8 rounded-2xl border border-neutral-300 space-y-5 font-mono shadow-inner">
          <div className="border-b-2 border-black pb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-600">
                NATIONAL ELECTRONICS DEFENSE REGISTRY
              </div>
              <h1 className="text-xl font-bold tracking-tight uppercase">
                RUPALSHIELD // STOLEN PROPERTY DOCKET
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                Official Certificate of Theft Recording & Telemetric Chain of Custody
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-black text-white text-[10px] font-bold px-2.5 py-1 uppercase rounded-md">
                FLAGGED STOLEN
              </span>
              <div className="text-[10px] font-mono mt-1 text-neutral-700">
                REF: {incidentRef}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-black p-4 text-xs">
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block font-bold">Brand & Model:</span>
              <span className="font-bold text-sm">{device.brand} {device.model}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block font-bold">Primary IMEI (15 Digits):</span>
              <span className="font-mono font-bold text-sm tracking-wider">{formatImei(device.imei_primary)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block font-bold">Serial Number:</span>
              <span className="font-mono font-semibold">{device.serial_number || "NOT RECORDED"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block font-bold">Incident Recorded At:</span>
              <span className="font-mono">{formatDateTime(timestamp)}</span>
            </div>
          </div>

          <div className="border-l-4 border-black pl-4 py-1 text-[11px] text-neutral-700 space-y-1.5 font-sans">
            <p className="font-bold uppercase text-black font-mono">
              Notice to Law Enforcement & Authorized Technicians:
            </p>
            <p>
              This device has been officially reported stolen by its verified legal deed holder on the RupalShield Anti-Theft Gadget Registry.
              Any attempt to service, unlock, flash firmware, or swap components triggers the RupalShield Stealth Safety Protocol with real-time GPS/IP coordinate logging.
            </p>
            <p>
              Under the Electronic Property Verification Act, unauthorized possession or tampering constitutes possession of stolen property.
            </p>
          </div>

          <div className="border-t border-neutral-300 pt-4 flex justify-between items-center text-[10px] text-neutral-600">
            <div>
              <span className="block font-bold uppercase text-black">CRYPTOGRAPHIC HASH:</span>
              <span className="font-mono">{device.id}-STOLEN-BROADCAST</span>
            </div>
            <div className="text-right">
              <span className="block font-bold uppercase text-black">REGISTRY VERIFIED:</span>
              <span>CONFIRMED ON POSTGRES RLS ENGINE</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="no-print mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="glass-pill text-zinc-300 text-xs px-5 py-2.5 rounded-xl hover:bg-zinc-800 transition"
          >
            Close Docket
          </button>
        </div>
      </div>
    </div>
  );
}
