import React from "react";
import Link from "next/link";
import { 
  Shield, 
  QrCode, 
  Smartphone, 
  Lock, 
  EyeOff, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Printer 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="font-mono text-white">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 border border-neutral-800 bg-neutral-950 px-3 py-1 rounded-full text-xs text-neutral-400 mb-6">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>NATIONAL ANTI-THEFT GADGET REGISTRY</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight uppercase max-w-4xl leading-tight">
          Cryptographic Hardware Deeds. <br />
          <span className="text-neutral-500">Silent Technician Protection.</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-neutral-400 max-w-2xl font-sans">
          RupalShield connects gadget owners, electronics repair clusters, and law enforcement.
          Instant IMEI barcode verification with the covert <strong>Stealth Safety Protocol</strong>.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
          <Link
            href="/technician/scan"
            className="bg-white hover:bg-neutral-200 text-black font-semibold px-6 py-3 rounded flex items-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            Launch Technician Terminal
          </Link>
          <Link
            href="/dashboard/devices"
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-medium px-6 py-3 rounded flex items-center gap-2 transition"
          >
            <Smartphone className="w-4 h-4" />
            Owner Registry & Deeds
          </Link>
          <Link
            href="/verify"
            className="bg-black hover:bg-neutral-950 border border-neutral-800 text-neutral-300 font-medium px-6 py-3 rounded flex items-center gap-2 transition"
          >
            Public IMEI Check
          </Link>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="border-t border-neutral-900 bg-neutral-950 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="border border-neutral-800 p-6 rounded-xl bg-black space-y-3">
            <div className="w-8 h-8 rounded border border-neutral-700 flex items-center justify-center text-white">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              The Stealth Safety Protocol
            </h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              When a stolen device is scanned over the counter, the interface shifts to a deceptive OEM hardware diagnostic card. No alarms or red banners. GPS coordinates, IP, and time are logged silently while exonerating the technician with a Clean Hands Token.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="border border-neutral-800 p-6 rounded-xl bg-black space-y-3">
            <div className="w-8 h-8 rounded border border-neutral-700 flex items-center justify-center text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Digital Ownership Deeds
            </h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Verifiable proof of device ownership anchored by 15-digit Luhn-validated IMEIs, serial numbers, and invoice proofs. Legitimate handoff mechanism to transfer deeds to buyers without paperwork.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="border border-neutral-800 p-6 rounded-xl bg-black space-y-3">
            <div className="w-8 h-8 rounded border border-neutral-700 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Police Incident Clearance
            </h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              One-tap stolen toggle instantly generates a standardized, printable police incident clearance docket containing cryptographic evidence, theft reference, and chain of custody for insurers.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 py-8 text-center text-[11px] text-neutral-500">
        <p>RUPALSHIELD DEFENSE SYSTEMS // MONOCHROME INDUSTRIAL ENGINE // POSTGRES RLS</p>
      </footer>
    </div>
  );
}
