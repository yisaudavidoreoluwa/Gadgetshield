"use client";

import React, { useState } from "react";
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
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  Maximize2,
  FileText,
  Clock,
  ShieldCheck,
  Check,
  ChevronRight,
  ExternalLink,
  Laptop
} from "lucide-react";
import { validateImeiLuhn } from "@/lib/utils/luhn";

export default function HomePage() {
  const [activeMockupTab, setActiveMockupTab] = useState<"scanner" | "dashboard" | "docket" | "verify">("scanner");
  const [interactiveImei, setInteractiveImei] = useState("358742091234567");

  return (
    <div className="text-zinc-100 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 sm:pt-24 sm:pb-32 flex flex-col items-center text-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2.5 glass-pill px-4 py-1.5 rounded-full text-xs font-mono text-zinc-300 mb-8 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>NATIONAL ANTI-THEFT ELECTRONICS DEFENSE REGISTRY</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.12]">
          Cryptographic Gadget Deeds. <br />
          <span className="text-zinc-400 font-normal">Silent Technician Protection.</span>
        </h1>

        <p className="mt-7 text-base sm:text-xl text-zinc-400 max-w-3xl leading-relaxed">
          The unified verification platform for electronics repair hubs, gadget owners, and law enforcement.
          Instant IMEI optical scanning paired with the deceptive <strong>Stealth Safety Protocol</strong>.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs font-medium">
          <Link
            href="/technician/scan"
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-7 py-4 rounded-full flex items-center gap-2.5 transition-all shadow-xl shadow-white/10 hover:scale-105 duration-200"
          >
            <QrCode className="w-4 h-4" />
            Launch Technician Hub
          </Link>
          <Link
            href="/dashboard/devices"
            className="glass-panel hover:bg-zinc-800/80 text-white px-7 py-4 rounded-full flex items-center gap-2.5 transition-all hover:scale-105 duration-200"
          >
            <Smartphone className="w-4 h-4" />
            Owner Registry & Deeds
          </Link>
          <Link
            href="/verify"
            className="glass-pill text-zinc-300 hover:text-white px-7 py-4 rounded-full flex items-center gap-2.5 transition-all hover:bg-zinc-800/50"
          >
            <Search className="w-4 h-4" />
            Public IMEI Check
          </Link>
        </div>

        {/* METRICS STRIP */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl font-mono text-xs text-left">
          <div className="glass-panel p-4 rounded-2xl border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Scan Latency</span>
            <span className="text-lg font-bold text-white mt-0.5 block">&lt; 40ms</span>
            <span className="text-[10px] text-emerald-400">BarcodeDetector API</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Counter Safety</span>
            <span className="text-lg font-bold text-white mt-0.5 block">100% Covert</span>
            <span className="text-[10px] text-zinc-400">Zero Red Alarms</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Legal Protection</span>
            <span className="text-lg font-bold text-white mt-0.5 block">Exonerated</span>
            <span className="text-[10px] text-emerald-400">Clean Hands Token</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Check Algorithm</span>
            <span className="text-lg font-bold text-white mt-0.5 block">Luhn Mod 10</span>
            <span className="text-[10px] text-zinc-400">15-Digit IMEI Verify</span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE 3D MOCKUP SHOWCASE STAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono tracking-widest uppercase text-emerald-400">
            Interactive Product Tour
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Engineered for Repair Counters & Owners Alike
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Explore 3D perspective views of each core screen across the RupalShield ecosystem.
          </p>

          {/* Tab Controls */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveMockupTab("scanner")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeMockupTab === "scanner"
                  ? "bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10"
                  : "glass-pill text-zinc-400 hover:text-white"
              }`}
            >
              ?? Technician Optical Scanner
            </button>
            <button
              onClick={() => setActiveMockupTab("dashboard")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeMockupTab === "dashboard"
                  ? "bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10"
                  : "glass-pill text-zinc-400 hover:text-white"
              }`}
            >
              ?? Owner Registry Dashboard
            </button>
            <button
              onClick={() => setActiveMockupTab("docket")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeMockupTab === "docket"
                  ? "bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10"
                  : "glass-pill text-zinc-400 hover:text-white"
              }`}
            >
              ?? Police Incident Docket
            </button>
            <button
              onClick={() => setActiveMockupTab("verify")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeMockupTab === "verify"
                  ? "bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10"
                  : "glass-pill text-zinc-400 hover:text-white"
              }`}
            >
              ?? Public Title Clearance
            </button>
          </div>
        </div>

        {/* 3D STAGE CONTAINER */}
        <div className="relative w-full min-h-[620px] glass-panel rounded-[36px] p-6 sm:p-12 flex items-center justify-center border-zinc-800/80 shadow-2xl overflow-hidden">
          {/* Subtle Stage Lighting */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: 3D MOBILE MOCKUP - TECHNICIAN SCANNER & STEALTH PROTOCOL */}
          {/* ------------------------------------------------------------- */}
          {activeMockupTab === "scanner" && (
            <div className="w-full max-w-sm mx-auto transition-all duration-500 animate-in fade-in zoom-in-95">
              {/* 3D Phone Chassis */}
              <div 
                className="relative rounded-[48px] border-[8px] border-zinc-700/80 bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(52,211,153,0.1)] p-3 overflow-hidden"
                style={{
                  transform: "perspective(1200px) rotateY(-6deg) rotateX(4deg)",
                  transition: "transform 0.4s ease-out"
                }}
              >
                {/* Dynamic Island */}
                <div className="w-24 h-5 bg-black rounded-full mx-auto mb-3 flex items-center justify-center gap-2 z-20 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Top Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono px-2 mb-2">
                  <span>RUPALSHIELD // SCANNER</span>
                  <span className="text-emerald-400 font-semibold">SILENT SHIELD ON</span>
                </div>

                {/* Viewfinder Viewport Mockup */}
                <div className="relative aspect-[4/3] w-full bg-zinc-900/90 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center mb-3">
                  {/* Camera Reticle */}
                  <div className="w-3/4 h-20 border border-white/30 rounded-xl relative flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                  </div>
                  <div className="absolute bottom-2 text-[8px] font-mono text-zinc-300 glass-pill px-2 py-0.5 rounded-full">
                    ALIGN IMEI BARCODE
                  </div>
                  {/* Floating Controls */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="p-1 rounded-lg glass-pill bg-amber-400 text-black">
                      <Zap className="w-3 h-3 fill-black" />
                    </div>
                  </div>
                </div>

                {/* The Stealth Deceptive Diagnostic Card Preview */}
                <div className="glass-panel rounded-2xl p-3.5 space-y-2 border-zinc-700/60 text-left">
                  <div className="flex justify-between items-start border-b border-zinc-800 pb-2">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 block">HARDWARE DIAGNOSTIC // OEM-CHECK</span>
                      <h4 className="text-xs font-semibold text-white">Original Parts Stock Not Available</h4>
                    </div>
                    <span className="text-[8px] font-mono glass-pill px-1.5 py-0.5 rounded-full text-zinc-400">
                      DIAG-409B
                    </span>
                  </div>

                  <div className="bg-zinc-900/90 rounded-xl p-2 text-[10px] space-y-1 text-zinc-400">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="text-white font-medium">Samsung S24 Ultra</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Board Subsystem:</span>
                      <span className="text-zinc-300">Rev 4.2B (Power Rail Impedance)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-zinc-400 pt-1">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Clean Hands Token Active
                    </span>
                    <span className="font-mono">TK-8921-EXON</span>
                  </div>

                  {/* Discreet Action Buttons */}
                  <div className="flex gap-1.5 pt-1">
                    <button className="flex-1 bg-white text-zinc-950 text-[10px] font-semibold py-1.5 rounded-lg">
                      Hold for Bench
                    </button>
                    <button className="flex-1 glass-pill text-zinc-300 text-[10px] py-1.5 rounded-lg">
                      Decline Board
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 text-center mt-4">
                <strong>The Stealth Protocol:</strong> Neutral disguise shown to customer; silent GPS & Clean Hands Token logged in background.
              </p>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: 3D DESKTOP MOCKUP - OWNER REGISTRY DASHBOARD           */}
          {/* ------------------------------------------------------------- */}
          {activeMockupTab === "dashboard" && (
            <div className="w-full max-w-3xl mx-auto transition-all duration-500 animate-in fade-in zoom-in-95">
              {/* macOS Dark Browser Window Chassis */}
              <div 
                className="relative rounded-2xl sm:rounded-3xl border border-zinc-700/80 bg-zinc-950 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.9)] overflow-hidden"
                style={{
                  transform: "perspective(1400px) rotateX(4deg)",
                  transition: "transform 0.4s ease-out"
                }}
              >
                {/* Browser Title Bar */}
                <div className="h-10 bg-zinc-900/90 border-b border-zinc-800 px-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 max-w-sm mx-auto glass-panel rounded-lg py-0.5 px-3 text-[11px] text-zinc-400 font-mono text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>rupalshield.io/dashboard/devices</span>
                  </div>
                </div>

                {/* Dashboard Inner Body */}
                <div className="p-6 sm:p-8 space-y-5 text-left font-sans">
                  <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Owner Gadget Registry</h3>
                      <p className="text-xs text-zinc-400">Anchored Cryptographic Deeds & Police Incident Dispatch</p>
                    </div>
                    <span className="bg-white text-zinc-950 font-semibold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                      + Register Device
                    </span>
                  </div>

                  {/* Device Card 1 (Clean Deed) */}
                  <div className="glass-panel rounded-2xl p-4 border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">Apple</span>
                        <h4 className="text-sm font-semibold text-white">iPhone 15 Pro (Titanium Black)</h4>
                      </div>
                      <span className="bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> CLEAN DEED
                      </span>
                    </div>
                    <div className="bg-zinc-900/80 p-2.5 rounded-xl text-xs font-mono text-zinc-400 flex justify-between">
                      <span>IMEI: 358742 091234 567</span>
                      <span className="text-zinc-500">SERIAL: F2LLN0G9XXXX</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="glass-pill px-3 py-1.5 rounded-lg text-white font-medium">View Deed</span>
                      <span className="glass-pill px-3 py-1.5 rounded-lg text-zinc-300">Transfer</span>
                      <span className="bg-white text-zinc-950 px-3 py-1.5 rounded-lg font-semibold ml-auto">
                        Report Stolen
                      </span>
                    </div>
                  </div>

                  {/* Device Card 2 (Flagged Stolen) */}
                  <div className="glass-panel rounded-2xl p-4 border-amber-500/40 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">Samsung</span>
                        <h4 className="text-sm font-semibold text-white">Galaxy S24 Ultra (Titanium Gray)</h4>
                      </div>
                      <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> FLAGGED STOLEN
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="glass-pill px-3 py-1.5 rounded-lg text-white font-medium">View Deed</span>
                      <span className="bg-white text-zinc-950 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                        <Printer className="w-3 h-3" /> Print Police Docket
                      </span>
                      <span className="glass-pill px-3 py-1.5 rounded-lg text-zinc-300 ml-auto">
                        Mark Recovered
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 text-center mt-4">
                <strong>Owner Hub:</strong> One-tap toggle to broadcast theft to all certified workshops nationwide.
              </p>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: 3D DOCUMENT / TABLET MOCKUP - POLICE INCIDENT DOCKET   */}
          {/* ------------------------------------------------------------- */}
          {activeMockupTab === "docket" && (
            <div className="w-full max-w-lg mx-auto transition-all duration-500 animate-in fade-in zoom-in-95">
              {/* Printable Docket Mockup with Paper Shadow & Tilt */}
              <div 
                className="bg-white text-black p-6 sm:p-8 rounded-3xl border border-neutral-300 font-mono text-left shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]"
                style={{
                  transform: "perspective(1200px) rotateY(5deg) rotateX(3deg)",
                  transition: "transform 0.4s ease-out"
                }}
              >
                <div className="border-b-2 border-black pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-neutral-600 block font-bold">
                      DEFENSE REGISTRY // INCIDENT FILE
                    </span>
                    <h3 className="text-base font-bold uppercase tracking-tight">
                      STOLEN PROPERTY DOCKET
                    </h3>
                  </div>
                  <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    FLAGGED STOLEN
                  </span>
                </div>

                <div className="border border-black p-3 my-3 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>Target Hardware:</span>
                    <strong className="text-black">Samsung Galaxy S24 Ultra</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>IMEI Primary:</span>
                    <strong className="text-black">862345 041234 568</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Theft Reference:</span>
                    <strong>RS-CRIME-SAM-901</strong>
                  </div>
                </div>

                <div className="border-l-2 border-black pl-2 py-1 text-[9px] text-neutral-700 space-y-1">
                  <p className="font-bold uppercase text-black">Notice to Law Enforcement:</p>
                  <p>
                    Verified deed holder has declared hardware stolen. Any counter servicing triggers silent GPS & IP telemetry.
                  </p>
                </div>

                <div className="border-t border-neutral-300 pt-3 flex justify-between items-center text-[8px] text-neutral-600">
                  <span>HASH: SHA-256 VERIFIED</span>
                  <span className="font-bold text-black flex items-center gap-1">
                    <Check className="w-3 h-3 text-black" /> RLS ANCHORED
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 text-center mt-4">
                <strong>Standard Police Docket:</strong> Official PDF/paper export with cryptographic chain of custody for insurers & police.
              </p>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: 3D MOBILE MOCKUP - PUBLIC TITLE CHECK                  */}
          {/* ------------------------------------------------------------- */}
          {activeMockupTab === "verify" && (
            <div className="w-full max-w-sm mx-auto transition-all duration-500 animate-in fade-in zoom-in-95">
              <div 
                className="relative rounded-[48px] border-[8px] border-zinc-700/80 bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-4 text-left font-mono"
                style={{
                  transform: "perspective(1200px) rotateY(6deg) rotateX(4deg)",
                  transition: "transform 0.4s ease-out"
                }}
              >
                <div className="w-24 h-5 bg-black rounded-full mx-auto mb-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800" />
                </div>

                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">Public Portal</span>
                <h4 className="text-sm font-semibold text-white mb-3">IMEI Title Clearance</h4>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 mb-3 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  <span>358742091234567</span>
                </div>

                <div className="glass-panel rounded-2xl p-4 space-y-3 border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-semibold text-white block">CLEAR TITLE CONFIRMED</span>
                      <span className="text-[9px] text-zinc-400">Zero active theft reports</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/80 p-2.5 rounded-xl text-[10px] space-y-1 text-zinc-400">
                    <div className="flex justify-between">
                      <span>Make:</span>
                      <span className="text-white">Apple iPhone 15 Pro</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Title State:</span>
                      <span className="text-emerald-400 font-semibold">CLEAN</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 text-center mt-4">
                <strong>Public Buyer Search:</strong> Instant verification before buying secondhand electronics to prevent receiving stolen goods.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. INTERACTIVE LUHN CHECKSUM TESTER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border-zinc-800 shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Interactive 15-Digit Luhn IMEI Checksum Engine
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
              Every authentic smartphone IMEI possesses a 15th check digit calculated via the Mod 10 Luhn algorithm. Test any IMEI live below:
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <input
              type="text"
              maxLength={15}
              value={interactiveImei}
              onChange={(e) => setInteractiveImei(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter 15 digits..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3.5 text-center text-base sm:text-lg text-white font-mono tracking-widest focus:outline-none focus:border-zinc-500 transition"
            />

            <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
              {interactiveImei.length === 15 ? (
                validateImeiLuhn(interactiveImei) ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Valid Luhn Checksum // Authentic Hardware Identifier
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Invalid Checksum // Fake or Manipulated IMEI
                  </span>
                )
              ) : (
                <span className="text-zinc-500">
                  {15 - interactiveImei.length} digits required for full Luhn evaluation
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 3 CORE PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* 5. CALL TO ACTION & FOOTER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="glass-panel rounded-3xl p-10 sm:p-14 border-zinc-800 shadow-2xl space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Ready to Protect Your Workshop or Device?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Create an account in under 30 seconds. Protect your repair hub from criminal receiving charges or anchor your gadget deed.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-8 py-3.5 rounded-full flex items-center gap-2 transition shadow-xl shadow-white/10"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800/80 py-10 text-center text-xs text-zinc-500 font-mono">
        <p>RUPALSHIELD DEFENSE PLATFORM // CUPERTINO 3D ENGINE // POSTGRES RLS</p>
      </footer>
    </div>
  );
}
