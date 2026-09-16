"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Smartphone, Wrench, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithOtp, switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"owner" | "technician">("technician");
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    switchRole(selectedRole);
    const { error } = await signInWithOtp(email, selectedRole);

    if (error) {
      setErrorMessage(error.message || "Failed to authenticate. Please check your credentials.");
      setIsSubmitting(false);
    } else {
      setSentSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        if (selectedRole === "technician") {
          router.push("/technician/scan");
        } else {
          router.push("/dashboard/devices");
        }
      }, 1200);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="glass-panel rounded-3xl p-7 space-y-6 shadow-2xl border-zinc-700/60 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-zinc-950 flex items-center justify-center font-bold shadow-lg">
            <Shield className="w-6 h-6 fill-black stroke-black" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-white">
            RupalShield Access Terminal
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in with email OTP or magic authentication link
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setSelectedRole("technician")}
            className={`py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              selectedRole === "technician"
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Technician
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("owner")}
            className={`py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              selectedRole === "owner"
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Owner
          </button>
        </div>

        {errorMessage && (
          <div className="glass-panel border-amber-500/30 text-amber-200 text-xs p-3 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {sentSuccess ? (
          <div className="glass-panel border-emerald-500/30 text-emerald-300 text-xs p-5 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Authentication Initiated</h3>
            <p className="text-zinc-400 text-xs">Redirecting to your authorized terminal...</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@repairhub.io"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            {selectedRole === "technician" && (
              <>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Repair Hub / Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Micro-Soldering Hub"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Market Cluster Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Computer Village Slot 14"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
