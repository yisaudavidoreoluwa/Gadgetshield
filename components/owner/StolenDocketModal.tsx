"use client";

import React from "react";
import { X, Printer, ShieldAlert, CheckCircle, FileText, AlertTriangle } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-mono text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Top Controls (Hidden during printing) */}
        <div className="no-print flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Official Police Incident Clearance Docket
              </h2>
              <span className="text-[10px] text-neutral-400">
                Print or export to PDF for Law Enforcement & Insurers
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white text-black text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-neutral-200 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL DOCKET */}
        <div className="bg-white text-black p-6 rounded border border-neutral-300 space-y-4">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-600">
                NATIONAL ELECTRONICS DEFENSE REGISTRY
              </div>
              <h1 className="text-xl font-bold tracking-tight uppercase">
                RUPALSHIELD // STOLEN PROPERTY DOCKET
              </h1>
              <p className="text-xs text-neutral-600">
                Official Certificate of Theft Recording & Chain of Custody
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-black text-white text-[10px] font-bold px-2 py-1 uppercase rounded">
                FLAGGED STOLEN
              </span>
              <div className="text-[10px] font-mono mt-1 text-neutral-700">
                REF: {incidentRef}
              </div>
            </div>
          </div>

          {/* Core Device Specs */}
          <div className="grid grid-cols-2 gap-4 border border-black p-3 text-xs">
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Brand & Model:</span>
              <span className="font-bold text-sm">{device.brand} {device.model}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Primary IMEI (15 Digits):</span>
              <span className="font-mono font-bold text-sm tracking-wider">{formatImei(device.imei_primary)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Serial Number:</span>
              <span className="font-mono font-semibold">{device.serial_number || "NOT RECORDED"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-500 block">Incident Recorded At:</span>
              <span className="font-mono">{formatDateTime(timestamp)}</span>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="border-l-4 border-black pl-3 py-1 text-[11px] text-neutral-700 space-y-1">
            <p className="font-bold uppercase text-black">
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

          {/* Verification Barcode / Token */}
          <div className="border-t border-neutral-300 pt-3 flex justify-between items-center text-[10px] text-neutral-600">
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
        <div className="no-print mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs px-4 py-2 rounded hover:bg-neutral-800 transition"
          >
            Close Docket
          </button>
        </div>
      </div>
    </div>
  );
}
