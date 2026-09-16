import React from "react";
import Link from "next/link";
import { 
  Shield, 
  QrCode, 
  Smartphone, 
  EyeOff, 
  ArrowRight, 
  Printer,
  Sparkles,
  Lock,
  Search
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="text-zinc-100">
      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 glass-pill px-3.5 py-1.5 rounded-full text-xs font-mono text-zinc-300 mb-8 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>NATIONAL ANTI-THEFT ELECTRONICS REGISTRY</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Cryptographic Hardware Deeds. <br />
          <span className="text-zinc-400 font-normal">Silent Technician Protection.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          RupalShield bridges gadget owners, electronics repair hubs, and law enforcement.
          Instant IMEI barcode verification equipped with the covert <strong>Stealth Safety Protocol</strong>.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3 text-xs">
          <Link
            href="/technician/scan"
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-6 py-3.5 rounded-full flex items-center gap-2 transition-all shadow-xl shadow-white/10"
          >
            <QrCode className="w-4 h-4" />
            Launch Technician Hub
          </Link>
          <Link
            href="/dashboard/devices"
            className="glass-panel hover:bg-zinc-800/80 text-white font-medium px-6 py-3.5 rounded-full flex items-center gap-2 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            Owner Registry & Deeds
          </Link>
          <Link
            href="/verify"
            className="glass-pill text-zinc-300 hover:text-white font-medium px-6 py-3.5 rounded-full flex items-center gap-2 transition-all"
          >
            <Search className="w-4 h-4" />
            Public IMEI Check
          </Link>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="glass-panel p-7 rounded-3xl space-y-3.5 border-zinc-800/80 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-white shadow-inner">
              <EyeOff className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white">
              The Stealth Safety Protocol
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When a stolen device is scanned over the counter, the interface shifts to a deceptive OEM hardware diagnostic card. Zero alarm banners. GPS coordinates and IP are logged silently while exonerating the repairer with a legal Clean Hands Token.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel p-7 rounded-3xl space-y-3.5 border-zinc-800/80 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-white shadow-inner">
              <Smartphone className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white">
              Digital Ownership Deeds
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verifiable proof of device ownership anchored by 15-digit Luhn-validated IMEIs, serial numbers, and invoice proofs. Legitimate handoff mechanism to transfer deeds to buyers without friction.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel p-7 rounded-3xl space-y-3.5 border-zinc-800/80 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-white shadow-inner">
              <Printer className="w-5 h-5 text-zinc-300" />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-white">
              Police Incident Clearance
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              One-tap stolen toggle instantly generates a standardized, printable police incident clearance docket containing cryptographic hashes, theft references, and chain of custody for insurers.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 py-10 mt-12 text-center text-xs text-zinc-500 font-mono">
        <p>RUPALSHIELD DEFENSE PLATFORM // CUPERTINO MINIMAL ENGINE // POSTGRES RLS</p>
      </footer>
    </div>
  );
}
