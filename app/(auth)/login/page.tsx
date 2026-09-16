"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Smartphone, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Lock,
  Mail,
  User,
  KeyRound,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { 
    signInWithPassword, 
    signUpWithPassword, 
    signInWithOtp, 
    isConfigured 
  } = useAuth();

  // Mode states: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [useOtp, setUseOtp] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"owner" | "technician">("owner");
  const [shopName, setShopName] = useState("");
  const [marketLocation, setMarketLocation] = useState("");

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. OTP Mode
    if (useOtp) {
      const { error } = await signInWithOtp(email, selectedRole);
      if (error) {
        setErrorMessage(error.message || "Failed to send magic link. Verify your email address.");
        setIsSubmitting(false);
      } else {
        setOtpSent(true);
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Email + Password Sign Up
    if (authMode === "signup") {
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await signUpWithPassword(email, password, {
        full_name: fullName.trim() || email.split("@")[0],
        role: selectedRole,
        shop_name: selectedRole === "technician" ? shopName.trim() : undefined,
        market_location: selectedRole === "technician" ? marketLocation.trim() : undefined,
      });

      if (error) {
        setErrorMessage(error.message || "Sign up failed. Please check your details.");
        setIsSubmitting(false);
      } else {
        // Successful signup & login
        setIsSubmitting(false);
        if (selectedRole === "technician") {
          router.push("/technician/scan");
        } else {
          router.push("/dashboard/devices");
        }
      }
      return;
    }

    // 3. Email + Password Sign In
    const { error } = await signInWithPassword(email, password);
    if (error) {
      setErrorMessage(error.message || "Invalid email or password.");
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      if (selectedRole === "technician") {
        router.push("/technician/scan");
      } else {
        router.push("/dashboard/devices");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      {/* Missing Supabase Env Diagnostic Warning */}
      {!isConfigured && (
        <div className="glass-panel border-amber-500/40 text-amber-200 text-xs p-4 rounded-3xl mb-5 space-y-1.5 shadow-xl">
          <div className="flex items-center gap-2 font-semibold text-white">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Supabase Keys Missing on Vercel</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            Authentication requires <code className="bg-zinc-900 px-1 py-0.5 rounded font-mono text-white">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-zinc-900 px-1 py-0.5 rounded font-mono text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            Add them in your <strong>Vercel Project &rarr; Settings &rarr; Environment Variables</strong>.
          </p>
        </div>
      )}

      <div className="glass-panel rounded-3xl p-7 space-y-6 shadow-2xl border-zinc-700/60 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-zinc-950 flex items-center justify-center font-bold shadow-lg">
            <Shield className="w-6 h-6 fill-black stroke-black" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-white">
            {authMode === "signin" ? "Sign In to RupalShield" : "Create Defense Account"}
          </h1>
          <p className="text-xs text-zinc-400">
            {authMode === "signin" 
              ? "Access your registered hardware deeds & verification hub"
              : "Register as a gadget owner or certified repair hub"}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setAuthMode("signin"); setErrorMessage(null); setOtpSent(false); }}
            className={`py-2 rounded-xl transition-all ${
              authMode === "signin"
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("signup"); setErrorMessage(null); setOtpSent(false); }}
            className={`py-2 rounded-xl transition-all ${
              authMode === "signup"
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="glass-panel border-red-500/30 text-red-200 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* OTP Success State */}
        {otpSent ? (
          <div className="glass-panel border-emerald-500/30 text-emerald-300 text-xs p-6 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">Magic Authentication Link Sent</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              We sent a secure one-tap verification link to <strong className="text-white font-mono">{email}</strong>. Please check your inbox or spam folder.
            </p>
            <button
              onClick={() => setOtpSent(false)}
              className="mt-3 text-xs text-white underline hover:text-zinc-300 font-medium"
            >
              Sign in with password instead
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("owner")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    selectedRole === "owner"
                      ? "border-zinc-500 bg-zinc-800/80 text-white font-semibold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Gadget Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("technician")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    selectedRole === "technician"
                      ? "border-zinc-500 bg-zinc-800/80 text-white font-semibold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Technician</span>
                </button>
              </div>
            </div>

            {/* Extra profile fields for Signup */}
            {authMode === "signup" && (
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Technician specific fields on Signup */}
            {authMode === "signup" && selectedRole === "technician" && (
              <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Repair Hub / Shop Name *</label>
                  <input
                    required
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Micro-Soldering Hub"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">Market Cluster Location *</label>
                  <input
                    required
                    type="text"
                    value={marketLocation}
                    onChange={(e) => setMarketLocation(e.target.value)}
                    placeholder="e.g. Computer Village Slot 14"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@repairhub.io"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition font-mono"
                />
              </div>
            </div>

            {/* Password (hidden if OTP mode) */}
            {!useOtp && (
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {useOtp 
                      ? "Send Magic Link" 
                      : authMode === "signup" ? "Create Free Account" : "Sign In with Password"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Toggle OTP vs Password */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setUseOtp(!useOtp)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 transition"
              >
                {useOtp ? "? Use Password instead" : "Use Email Magic Link / OTP instead ?"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
