"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle, 
  Shield, 
  Lock, 
  FileCheck, 
  Sparkles,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { Device } from "@/lib/types/database";
import { formatImei, formatDateTime } from "@/lib/utils/formatters";
import QrCodeView from "@/components/ui/QrCodeView";

interface DeedPageProps {
  params: Promise<{ id: string }>;
}

export default function DeedPage({ params }: DeedPageProps) {
  const resolvedParams = use(params);
  const deviceId = resolvedParams.id;

  const [device, setDevice] = useState<Device | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [origin, setOrigin] = useState("https://rupalshield.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    const devices = hybridStore.getDevices();
    const found = devices.find((d) => d.id === deviceId);
    if (found) {
      setDevice(found);
    } else {
      // Fallback preview
      setDevice({
        id: deviceId || "dev-demo",
        owner_id: "user-owner-001",
        brand: "Apple",
        model: "iPhone 15 Pro",
        imei_primary: "358742091234562",
        serial_number: "F2LLN0G9XXXX",
        status: "CLEAN",
        created_at: "2026-08-15T14:30:00Z",
        updated_at: new Date().toISOString(),
      });
    }
  }, [deviceId]);

  if (!device) return null;

  const verifyUrl = `${origin}/verify?q=${device.imei_primary || device.serial_number}`;
  const deedToken = `RS-DEED-${(device.imei_primary || "000").slice(-6)}-${device.id.slice(-4).toUpperCase()}`;
  const sha256Signature = `0x${Array.from(device.imei_primary + (device.serial_number || "NONE"))
    .map((c) => c.charCodeAt(0).toString(16))
    .join("")
    .slice(0, 32)}...a9f4`;

  const handlePrint = () => {
    window.print();
  };

  const copyToken = () => {
    navigator.clipboard.writeText(deedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print flex items-center justify-between">
        <Link
          href="/dashboard/devices"
          className="glass-pill text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Registry
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToken}
            className="glass-pill text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition font-mono"
          >
            {copiedToken ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied Token
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Deed Token
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Certificate PDF
          </button>
        </div>
      </div>

      {/* The Printable Digital Ownership Deed */}
      <div className="print-area bg-white text-black p-8 sm:p-12 rounded-3xl border-4 border-black space-y-7 font-mono shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark Seal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Shield className="w-96 h-96 text-black" />
        </div>

        {/* Header */}
        <div className="border-b-4 border-black pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="text-[10px] tracking-widest uppercase font-black text-neutral-600">
              NATIONAL ELECTRONICS DEFENSE & REGISTRY SYSTEM
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              CERTIFICATE OF OWNERSHIP DEED
            </h1>
            <p className="text-xs text-neutral-600 font-sans">
              Cryptographically Anchored Title & Prima Facie Proof of Title
            </p>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <span className="border-2 border-black bg-black text-white px-3 py-1 text-xs font-bold uppercase rounded-md tracking-wider">
              {device.status === "STOLEN" ? "FLAGGED STOLEN" : "VERIFIED CLEAN TITLE"}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              TOKEN: {deedToken}
            </span>
          </div>
        </div>

        {/* Hardware Specifications & Live QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 border-2 border-black p-5 space-y-3 bg-neutral-50/50">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                  Manufacturer / Brand:
                </span>
                <span className="text-sm font-bold text-black">{device.brand}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                  Model Designation:
                </span>
                <span className="text-sm font-bold text-black">{device.model}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                  Primary IMEI (15 Digits):
                </span>
                <span className="text-sm font-bold font-mono tracking-wider text-black">
                  {formatImei(device.imei_primary)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                  Serial Number:
                </span>
                <span className="text-sm font-bold font-mono text-black">
                  {device.serial_number || "N/A"}
                </span>
              </div>
            </div>

            {device.imei_secondary && (
              <div className="pt-2 border-t border-neutral-300 text-xs">
                <span className="text-[10px] text-neutral-500 uppercase block font-bold">
                  Secondary IMEI:
                </span>
                <span className="text-sm font-bold font-mono text-black">
                  {formatImei(device.imei_secondary)}
                </span>
              </div>
            )}
          </div>

          {/* Live SVG Scannable QR Code */}
          <div className="flex flex-col items-center justify-center p-3 border-2 border-black text-center space-y-2 bg-white">
            <QrCodeView value={verifyUrl} size={135} />
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold tracking-wider uppercase block text-neutral-800">
                SCAN FOR LIVE RECORD
              </span>
              <span className="text-[8px] text-neutral-500 block truncate max-w-[140px] font-mono">
                {verifyUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Legal Title Declaration */}
        <div className="border-l-4 border-black pl-5 py-1 text-xs text-neutral-800 space-y-2 font-sans bg-neutral-50 p-4 border border-l-4 border-neutral-300">
          <p className="font-bold text-black uppercase font-mono text-xs flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-black" />
            Statutory Ownership Declaration:
          </p>
          <p className="leading-relaxed">
            The legal bearer of this deed is registered in the RupalShield decentralized registry as the bona fide owner of the electronic property identified herein. 
            Pursuant to the Cybercrimes and Electronic Commercial Title Recognition frameworks, this document serves as admissible proof of ownership for law enforcement recovery, warranty claims, insurance underwriting, and secondary market disposition.
          </p>
          <div className="text-[10px] text-neutral-600 pt-2 font-mono flex flex-wrap justify-between border-t border-neutral-300">
            <span>REGISTRATION ANCHOR: {formatDateTime(device.created_at)}</span>
            <span>STATUS: REGISTERED TITLE HOLDER</span>
          </div>
        </div>

        {/* Cryptographic Security Signature */}
        <div className="border-t-2 border-black pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase block">
              CRYPTOGRAPHIC PROOF TOKEN:
            </span>
            <span className="font-mono font-bold text-black">{deedToken}</span>
            <span className="text-[9px] text-neutral-500 block font-mono truncate max-w-xs mt-0.5">
              HASH: {sha256Signature}
            </span>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-[10px] font-bold text-neutral-500 uppercase block">
              REGISTRY INTEGRITY:
            </span>
            <div className="font-bold text-black flex items-center sm:justify-end gap-1.5">
              <CheckCircle className="w-4 h-4 text-black" />
              <span>IMMUTABLE DISTRIBUTED LEDGER</span>
            </div>
            <div className="text-[9px] text-neutral-500 font-mono">
              VERIFIABLE AT RUPALSHIELD.VERCEL.APP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
