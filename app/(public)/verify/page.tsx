"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { validateImeiLuhn } from "@/lib/utils/luhn";
import { formatImei } from "@/lib/utils/formatters";

export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [rateLimitCount, setRateLimitCount] = useState(5);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.replace(/[^0-9A-Za-z]/g, "");
    if (clean.length < 8) return;

    setLoading(true);
    setResult(null);

    setRateLimitCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: clean }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ status: "UNREGISTERED", imei: clean });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Public Title & Theft Clearance Lookup
        </h1>
        <p className="text-xs text-zinc-400">
          Verify device clearance status before buying secondhand electronics.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearch} className="glass-panel rounded-3xl p-5 space-y-3 shadow-2xl border-zinc-700/60">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter 15-digit IMEI or Serial Number"
            className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500 font-mono tracking-wider placeholder:text-zinc-600 transition"
          />
          <button
            type="submit"
            disabled={loading || query.length < 8}
            className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold px-6 py-3 rounded-2xl flex items-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500 transition shadow-lg"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Check
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono px-1">
          <span>Anti-scraping: {rateLimitCount} queries remaining</span>
          {query.length === 15 && validateImeiLuhn(query) && (
            <span className="text-emerald-400 font-sans">Luhn Checksum Verified</span>
          )}
        </div>
      </form>

      {/* Lookup Result Card */}
      {result && (
        <div className="glass-panel rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-2xl border-zinc-700/60">
          {result.status === "FLAGGED_STOLEN" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    WARNING: STOLEN PROPERTY RECORDED
                  </h3>
                  <span className="text-xs text-zinc-400">
                    This IMEI is blacklisted on the National Registry.
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Do NOT purchase or service this device. Possession of blacklisted equipment violates criminal receiving statutes.
              </p>
            </div>
          ) : result.status === "VERIFIED_CLEAN" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    VERIFIED CLEAN RECORD
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Device is legally registered with no outstanding theft flags.
                  </span>
                </div>
              </div>
              <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Make & Model:</span>
                  <span className="text-white font-medium">{result.brand} {result.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Title Status:</span>
                  <span className="text-emerald-400 font-semibold">CLEAN TITLE</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    UNREGISTERED IDENTIFIER
                  </h3>
                  <span className="text-xs text-zinc-400">
                    No active theft reports on file.
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This gadget is not yet registered by an owner in the RupalShield registry. Encourage the seller to issue an ownership deed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
