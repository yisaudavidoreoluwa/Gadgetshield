"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Building2, 
  Smartphone, 
  HelpCircle, 
  ArrowRight, 
  Lock,
  Sparkles,
  Radio,
  FileCheck
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { BillingCurrency, BillingTier } from "@/lib/types/database";

export default function PricingPage() {
  const [currency, setCurrency] = useState<BillingCurrency>("USD");
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [activePlan, setActivePlan] = useState<BillingTier>(() => {
    if (typeof window !== "undefined") {
      return hybridStore.getSubscription().tier;
    }
    return "free";
  });
  const [upgradedTier, setUpgradedTier] = useState<string | null>(null);

  const handleSelectTier = (tier: BillingTier) => {
    hybridStore.upgradeSubscription(tier, currency);
    setActivePlan(tier);
    setUpgradedTier(tier);
    setTimeout(() => setUpgradedTier(null), 3500);
  };

  const prices = {
    free: { USD: { monthly: 0, annual: 0 }, NGN: { monthly: 0, annual: 0 } },
    pro: { 
      USD: { monthly: 4.99, annual: 3.99 }, 
      NGN: { monthly: 4500, annual: 3750 } 
    },
    fleet: { 
      USD: { monthly: 29.99, annual: 24.99 }, 
      NGN: { monthly: 35000, annual: 29000 } 
    }
  };

  const currSymbol = currency === "USD" ? "$" : "₦";

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-700/60 bg-zinc-900/80 text-[11px] font-mono text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span>INSTITUTIONAL ASSET DEFENSE // TIERED ENGINE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Predictable Protection for Every Gadget
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          From single consumers securing their personal smartphone to distributed SME IT fleets and certified secondhand electronics dealers.
        </p>

        {/* Currency & Frequency Switchers */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Currency Switcher */}
          <div className="glass-panel p-1 rounded-2xl flex items-center border border-zinc-800">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
                currency === "USD"
                  ? "bg-white text-zinc-950 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              USD ($ Stripe)
            </button>
            <button
              onClick={() => setCurrency("NGN")}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
                currency === "NGN"
                  ? "bg-white text-zinc-950 shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              NGN (₦ Paystack)
            </button>
          </div>

          {/* Billing Interval Switcher */}
          <div className="glass-panel p-1 rounded-2xl flex items-center border border-zinc-800">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition ${
                !isAnnual
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Success Notification */}
      {upgradedTier && (
        <div className="glass-panel border-emerald-500/50 bg-emerald-500/10 text-emerald-300 p-4 rounded-2xl text-center text-xs font-mono animate-in fade-in duration-200 flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Subscription plan successfully updated to {upgradedTier.toUpperCase()} tier!</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Consumer Free */}
        <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between border-zinc-800 hover:border-zinc-700 transition space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Consumer Starter
              </span>
              <h3 className="text-xl font-bold text-white">Free Title Deed</h3>
              <p className="text-xs text-zinc-400">
                Essential ownership registration & public theft clearance lookup.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {currSymbol}0
                </span>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>1 Registered Personal Gadget</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Digital Ownership Certificate with QR</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Public IMEI / Serial Verification Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Standard Ownership Transfer</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => handleSelectTier("free")}
              disabled={activePlan === "free"}
              className={`w-full text-xs font-semibold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 ${
                activePlan === "free"
                  ? "bg-zinc-800 text-zinc-400 cursor-default"
                  : "bg-white hover:bg-zinc-200 text-zinc-950 shadow"
              }`}
            >
              {activePlan === "free" ? "Current Plan" : "Choose Starter"}
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Defense (Highlighted) */}
        <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between border-white/40 bg-zinc-900/60 shadow-2xl relative space-y-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
            RECOMMENDED FOR INDIVIDUALS & FAMILIES
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                PRO DEFENSE RADAR
              </span>
              <h3 className="text-xl font-bold text-white">Advanced Recovery</h3>
              <p className="text-xs text-zinc-400">
                Lawful property recovery portal, active session radar telemetry, and 1-tap police dockets.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {currSymbol}
                  {isAnnual
                    ? prices.pro[currency].annual.toLocaleString()
                    : prices.pro[currency].monthly.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500">
                  / mo {isAnnual ? "(billed annually)" : ""}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-800 text-xs text-zinc-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-white">Up to 5 Registered Devices</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Lawful Property Recovery & Custody Portal (/recover/[id])</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Active Session GPS & IP Telemetry Radar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>1-Tap Printable Police Stolen Docket</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Real-time Custody & Recovery Check-In Alerting</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => handleSelectTier("pro")}
              disabled={activePlan === "pro"}
              className={`w-full text-xs font-semibold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 ${
                activePlan === "pro"
                  ? "bg-zinc-800 text-zinc-400 cursor-default"
                  : "bg-white hover:bg-zinc-200 text-zinc-950 shadow-lg"
              }`}
            >
              {activePlan === "pro" ? "Current Plan" : "Upgrade to Pro"}
              {activePlan !== "pro" && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tier 3: SME IT Fleet & Dealer */}
        <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between border-zinc-800 hover:border-zinc-700 transition space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                ENTERPRISE & SME
              </span>
              <h3 className="text-xl font-bold text-white">Fleet & Dealer Suite</h3>
              <p className="text-xs text-zinc-400">
                Centralized IT asset allocation, instant lockdown, and dealer forensic scan API.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {currSymbol}
                  {isAnnual
                    ? prices.fleet[currency].annual.toLocaleString()
                    : prices.fleet[currency].monthly.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500">
                  / mo {isAnnual ? "(billed annually)" : ""}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">Unlimited IT Fleet Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bulk CSV / Excel IMEI & Serial Ingestion</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Automated Employee Allocation & Department Tags</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant Remote Lockdown Trigger</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dealer Forensic Scan API & Clean Hands Tokens</span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => handleSelectTier("fleet")}
              disabled={activePlan === "fleet"}
              className={`w-full text-xs font-semibold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 ${
                activePlan === "fleet"
                  ? "bg-zinc-800 text-zinc-400 cursor-default"
                  : "bg-white hover:bg-zinc-200 text-zinc-950 shadow"
              }`}
            >
              {activePlan === "fleet" ? "Current Plan" : "Select SME Fleet Suite"}
            </button>
          </div>
        </div>
      </div>

      {/* Trust & FAQ Section */}
      <div className="pt-8 border-t border-zinc-800/80 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">
            Everything you need to know about our non-invasive architecture and legal validity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="glass-panel p-5 rounded-2xl border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Does this drain my device battery with continuous background GPS?
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              No. Gadgetshield purposefully avoids battery-draining invasive malware. Telemetry pings occur during active authenticated sessions, and location coordinates are only captured when explicitly permitted during safe custody handover reports.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              Is the Digital Ownership Certificate legally recognized?
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              Yes. The certificate includes a cryptographically verifiable SHA-256 signature hash and permanent timestamp recognized as prima facie proof of title by law enforcement agencies, warranty providers, and secondhand dealers.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              How does the Lawful Property Recovery Portal work?
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              When a gadget is marked stolen or missing, you receive an official recovery portal link (/recover/[id]). Finders, current possessors, or repair shops can securely report safe custody, drop off the gadget at accredited centers, or coordinate courier pickup under Clean Hands statutory protection without hostile tracking.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-zinc-800 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-300" />
              What payment methods are supported?
            </h4>
            <p className="text-zinc-400 leading-relaxed">
              We support worldwide credit/debit cards via Stripe for USD, and bank transfers, USSD, and cards via Paystack for Nigerian Naira (NGN).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
