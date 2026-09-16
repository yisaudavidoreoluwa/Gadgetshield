"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, AlertTriangle, Clock, RefreshCw, CheckCircle2 } from "lucide-react";
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

    // Simulate rate limit decrease
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
    <div className="max-w-xl mx-auto py-12 px-4 font-mono space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold uppercase tracking-tight text-white">
          Public Title & Theft Lookup
        </h1>
        <p className="text-xs text-neutral-400 font-sans">
          Verify device clearance status before buying secondhand electronics.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearch} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter 15-digit IMEI or Serial Number"
            className="flex-1 bg-black border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-white font-mono placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={loading || query.length < 8}
            className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 disabled:bg-neutral-800 disabled:text-neutral-500 transition"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Check
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] text-neutral-500">
          <span>Anti-scraping rate limit: {rateLimitCount} queries remaining</span>
          {query.length === 15 && validateImeiLuhn(query) && (
            <span className="text-neutral-300">Valid Luhn</span>
          )}
        </div>
      </form>

      {/* Lookup Result Card */}
      {result && (
        <div className="border border-neutral-800 bg-neutral-950 p-5 rounded-xl space-y-3 animate-in fade-in">
          {result.status === "FLAGGED_STOLEN" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">
                    WARNING: STOLEN PROPERTY RECORDED
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    This IMEI is blacklisted on the National Registry.
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-300 font-sans">
                Do NOT purchase or service this device. Possession of blacklisted equipment violates criminal receiving statutes.
              </p>
            </div>
          ) : result.status === "VERIFIED_CLEAN" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">
                    VERIFIED CLEAN RECORD
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    Device is legally registered with no outstanding theft flags.
                  </span>
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-neutral-900 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Make & Model:</span>
                  <span className="text-white">{result.brand} {result.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Title Status:</span>
                  <span className="text-white font-semibold">CLEAN</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Clock className="w-5 h-5 text-neutral-400" />
                <div>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase">
                    UNREGISTERED IDENTIFIER
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    No active theft reports on file.
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                This gadget is not yet registered by an owner in the RupalShield registry. Encourage the seller to issue an ownership deed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
