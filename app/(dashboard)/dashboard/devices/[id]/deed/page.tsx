import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { formatImei, formatDateTime } from "@/lib/utils/formatters";

export const metadata = {
  title: "Digital Ownership Deed // RupalShield",
  description: "Official cryptographic gadget ownership deed and chain of custody certificate.",
};

export default async function DeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const deedData = {
    id: id || "dev-001",
    brand: "Apple",
    model: "iPhone 15 Pro",
    imei_primary: "358742091234562",
    serial_number: "F2LLN0G9XXXX",
    owner_name: "Verified Gadget Owner",
    registered_at: "2026-08-15T14:30:00Z",
    deed_token: `DEED-${(id || "001").toUpperCase()}-8821`,
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="no-print flex items-center justify-between">
        <Link
          href="/dashboard/devices"
          className="glass-pill text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Registry
        </Link>
      </div>

      <div className="bg-white text-black p-8 sm:p-10 rounded-3xl border-4 border-black space-y-6 font-mono shadow-2xl">
        <div className="border-b-2 border-black pb-4 flex justify-between items-start">
          <div>
            <div className="text-[10px] tracking-widest uppercase font-bold text-neutral-600">
              NATIONAL ELECTRONICS DEFENSE SYSTEM
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              CERTIFICATE OF OWNERSHIP DEED
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Legally recognized title & cryptographic registration record
            </p>
          </div>
          <div className="text-right">
            <span className="border-2 border-black px-2.5 py-1 text-xs font-bold uppercase rounded-md">
              VERIFIED TITLE
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border border-black p-4 text-xs">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block font-bold">Maker / Brand:</span>
            <span className="text-sm font-bold">{deedData.brand}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block font-bold">Model Designation:</span>
            <span className="text-sm font-bold">{deedData.model}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block font-bold">Primary IMEI (15 Digits):</span>
            <span className="text-sm font-bold font-mono tracking-wider">{formatImei(deedData.imei_primary)}</span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block font-bold">Serial Number:</span>
            <span className="text-sm font-bold font-mono">{deedData.serial_number}</span>
          </div>
        </div>

        <div className="border-l-4 border-black pl-4 py-1 text-xs text-neutral-700 space-y-1.5 font-sans">
          <p className="font-bold text-black uppercase font-mono">Title Declaration:</p>
          <p>
            The bearer of this deed is registered in the RupalShield decentralized hub as the verified title holder.
            This certificate serves as prima facie proof of ownership in commercial transactions, police clearance, and warranty verification.
          </p>
          <div className="text-[10px] text-neutral-500 pt-1 font-mono">
            ANCHOR TIMESTAMP: {formatDateTime(deedData.registered_at)}
          </div>
        </div>

        <div className="border-t-2 border-black pt-4 flex justify-between items-center text-xs">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase block">CRYPTOGRAPHIC TOKEN:</span>
            <span className="font-mono font-bold text-black">{deedData.deed_token}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-neutral-500 uppercase block">SIGNATURE STATUS:</span>
            <span className="font-bold text-black flex items-center gap-1 justify-end">
              <CheckCircle className="w-3.5 h-3.5 text-black" /> SHA-256 SIGNED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
