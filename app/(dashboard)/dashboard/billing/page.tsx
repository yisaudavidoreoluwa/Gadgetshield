"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Check, 
  Sparkles, 
  Building2, 
  Smartphone, 
  ArrowUpRight, 
  RefreshCw,
  Clock,
  Download
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { SubscriptionPlan, BillingTier, BillingCurrency } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/formatters";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionPlan>(() => {
    if (typeof window !== "undefined") {
      return hybridStore.getSubscription();
    }
    return {
      tier: "pro",
      currency: "USD",
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 300).toISOString(),
      max_devices: 100,
      features: ["Active Telemetry Radar", "Covert Decoy Traps", "Police Stolen Docket"],
    };
  });

  const [deviceCount, setDeviceCount] = useState<number>(2);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const sub = hybridStore.getSubscription();
    setSubscription(sub);
    const devices = hybridStore.getDevices();
    setDeviceCount(devices.length);
  }, []);

  const handleTierSwitch = (newTier: BillingTier) => {
    setIsUpdating(true);
    setTimeout(() => {
      const updated = hybridStore.upgradeSubscription(newTier, subscription.currency);
      setSubscription(updated);
      setIsUpdating(false);
      setSuccessMsg(`Account plan successfully shifted to ${newTier.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 400);
  };

  const handleCurrencyToggle = (newCurrency: BillingCurrency) => {
    const updated = hybridStore.upgradeSubscription(subscription.tier, newCurrency);
    setSubscription(updated);
  };

  const isPro = subscription.tier === "pro";
  const isFleet = subscription.tier === "fleet";
  const isFree = subscription.tier === "free";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl border-zinc-700/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-zinc-300" />
            Subscription & Billing Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your protection tier, active seats, and dual-currency billing channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dual Currency Switcher */}
          <div className="glass-panel p-1 rounded-2xl flex items-center border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => handleCurrencyToggle("USD")}
              className={`px-3 py-1 rounded-xl transition ${
                subscription.currency === "USD"
                  ? "bg-white text-zinc-950 font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => handleCurrencyToggle("NGN")}
              className={`px-3 py-1 rounded-xl transition ${
                subscription.currency === "NGN"
                  ? "bg-white text-zinc-950 font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              NGN (₦)
            </button>
          </div>

          <Link
            href="/pricing"
            className="glass-pill text-xs text-zinc-200 hover:text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition font-medium"
          >
            View All Plans
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="glass-panel border-emerald-500/50 bg-emerald-500/10 text-emerald-300 p-4 rounded-2xl text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Subscription Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier Card */}
        <div className="glass-panel rounded-3xl p-6 border-zinc-700/70 space-y-4 md:col-span-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                ACTIVE PLAN TIER
              </span>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white capitalize">
                  {subscription.tier === "pro"
                    ? "Pro Defense Radar"
                    : subscription.tier === "fleet"
                    ? "SME Fleet & Dealer Suite"
                    : "Consumer Starter (Free)"}
                </h2>
                <span className="bg-emerald-400/10 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase">
                  {subscription.status}
                </span>
              </div>
            </div>

            <span className="text-xs font-mono text-zinc-400">
              Renews: {formatDateTime(subscription.expires_at)}
            </span>
          </div>

          {/* Metered Limits */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Hardware Slots Allocated:</span>
              <span className="text-white font-mono font-bold">
                {deviceCount} of {subscription.max_devices} slots used
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(10, (deviceCount / subscription.max_devices) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Quick Upgrade Switches */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            {!isPro && (
              <button
                onClick={() => handleTierSwitch("pro")}
                disabled={isUpdating}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Zap className="w-3.5 h-3.5" />
                Switch to Pro Defense
              </button>
            )}
            {!isFleet && (
              <button
                onClick={() => handleTierSwitch("fleet")}
                disabled={isUpdating}
                className="glass-pill hover:bg-zinc-800 text-zinc-200 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                Upgrade to SME Fleet
              </button>
            )}
            {!isFree && (
              <button
                onClick={() => handleTierSwitch("free")}
                disabled={isUpdating}
                className="text-zinc-500 hover:text-zinc-300 px-3 py-2 text-[11px] transition font-mono"
              >
                Downgrade to Starter
              </button>
            )}
          </div>
        </div>

        {/* Payment Instrument Card */}
        <div className="glass-panel rounded-3xl p-6 border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              PAYMENT METHOD ON FILE
            </span>

            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-zinc-400" />
                  {subscription.currency === "USD" ? "Stripe Global Card" : "Paystack Direct Debit"}
                </span>
                <span className="font-mono text-zinc-400">•••• 4242</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                Expires 12/28 // Auto-debit active
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-zinc-400 leading-relaxed font-sans">
            Invoices are charged in {subscription.currency} automatically. You can switch currencies anytime with zero penalty.
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="glass-panel rounded-3xl p-6 border-zinc-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            Billing & Invoicing History
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">
            Export receipts for accounting
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80 text-xs">
          <div className="py-3 flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="text-white font-medium">Annual Pro Defense Subscription</div>
              <div className="text-[10px] text-zinc-500 font-mono">INV-2026-0814 // Paid via Card</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-mono font-bold">
                {subscription.currency === "USD" ? "$49.00" : "₦45,000"}
              </span>
              <button className="text-zinc-400 hover:text-white p-1.5 glass-pill rounded-lg transition" title="Download Receipt">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="text-white font-medium">Device Forensic Clearance Validation</div>
              <div className="text-[10px] text-zinc-500 font-mono">INV-2026-0701 // Certified Clearance</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-mono font-bold">INCLUDED</span>
              <button className="text-zinc-400 hover:text-white p-1.5 glass-pill rounded-lg transition" title="Download Receipt">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
