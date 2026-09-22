"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Building2,
  ArrowLeft,
  FileCheck
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { UserRole } from "@/lib/types/database";

export default function LoginPage() {
  const router = useRouter();
  const { 
    signInWithPassword, 
    signUpWithPassword, 
    signInWithOtp, 
    isConfigured 
  } = useAuth();

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [useOtp, setUseOtp] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner");

  // SME Fleet specific fields
  const [companyName, setCompanyName] = useState("");
  const [rcNumber, setRcNumber] = useState("");

  // Technician specific fields
  const [shopName, setShopName] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [tradeAssociation, setTradeAssociation] = useState("CAPDAN (Computer and Allied Products Dealers)");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [proofDocumentUrl, setProofDocumentUrl] = useState("");

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. OTP / Magic Link Mode
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

    // 2. Sign Up Mode
    if (authMode === "signup") {
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        setIsSubmitting(false);
        return;
      }

      if (selectedRole === "technician") {
        if (!shopName.trim() || !workshopAddress.trim() || !licenseNumber.trim()) {
          setErrorMessage("Technician registration strictly requires workshop trading name, street address, and trade guild license number.");
          setIsSubmitting(false);
          return;
        }
      }

      if (selectedRole === "fleet_manager") {
        if (!companyName.trim() || !rcNumber.trim()) {
          setErrorMessage("SME Fleet registration requires Company Name and Corporate Affairs / RC Number.");
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await signUpWithPassword(email, password, {
        full_name: fullName.trim() || email.split("@")[0],
        role: selectedRole,
        company_name: selectedRole === "fleet_manager" ? companyName.trim() : undefined,
        rc_number: selectedRole === "fleet_manager" ? rcNumber.trim() : undefined,
        shop_name: selectedRole === "technician" ? shopName.trim() : undefined,
        workshop_address: selectedRole === "technician" ? workshopAddress.trim() : undefined,
        trade_association: selectedRole === "technician" ? tradeAssociation.trim() : undefined,
        license_number: selectedRole === "technician" ? licenseNumber.trim() : undefined,
        proof_document_url: selectedRole === "technician" ? proofDocumentUrl.trim() : undefined,
      });

      if (error) {
        setErrorMessage(error.message || "Sign up failed. Please verify your details.");
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        if (selectedRole === "technician") {
          router.push("/technician/scan");
        } else if (selectedRole === "fleet_manager") {
          router.push("/dashboard/fleet");
        } else {
          router.push("/dashboard/devices");
        }
      }
      return;
    }

    // 3. Sign In Mode
    const { error } = await signInWithPassword(email, password);
    if (error) {
      setErrorMessage(error.message || "Invalid email or password.");
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      if (selectedRole === "technician") {
        router.push("/technician/scan");
      } else if (selectedRole === "fleet_manager") {
        router.push("/dashboard/fleet");
      } else {
        router.push("/dashboard/devices");
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="glass-pill text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>

          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            SECURE ACCESS GATE
          </span>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-7 sm:p-9 shadow-2xl border-zinc-700/80 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-black flex items-center justify-center font-bold shadow-md">
              <Shield className="w-6 h-6 fill-black stroke-black" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {authMode === "signin" ? "Sign In to Private Console" : "Create Protected Account"}
            </h1>
            <p className="text-xs text-zinc-400">
              {authMode === "signin"
                ? "Enter your credentials to access your private hardware registry."
                : "Register your private workspace with strict role-based isolation."}
            </p>
          </div>

          {/* Mode Tabs (Sign In vs Sign Up) */}
          <div className="glass-panel p-1 rounded-2xl flex items-center border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl font-medium transition ${
                authMode === "signin"
                  ? "bg-white text-zinc-950 font-semibold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl font-medium transition ${
                authMode === "signup"
                  ? "bg-white text-zinc-950 font-semibold shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Persona Role Tabs (When Signing Up) */}
          {authMode === "signup" && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase text-zinc-400 block">
                Select Your Account Persona:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("owner")}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedRole === "owner"
                      ? "bg-zinc-800 border-white text-white shadow"
                      : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold">Gadget Owner</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Personal Deeds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("fleet_manager")}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedRole === "fleet_manager"
                      ? "bg-zinc-800 border-white text-white shadow"
                      : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">SME Fleet</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Company IT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("technician")}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedRole === "technician"
                      ? "bg-zinc-800 border-white text-white shadow"
                      : "glass-panel border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold">Technician</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Proof Req.</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="glass-panel border-red-500/50 bg-red-500/10 text-red-300 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {otpSent && (
            <div className="glass-panel border-emerald-500/50 bg-emerald-500/10 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Magic link dispatched to {email}. Follow the email link to authenticate.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 block">
                  Full Name / Contact Person
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. David Oreoluwa"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400 block">
                {selectedRole === "fleet_manager" ? "Corporate Work Email" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                />
              </div>
            </div>

            {/* Password Field (unless OTP) */}
            {!useOtp && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 block">
                  Password (6+ characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            )}

            {/* SME Fleet specific inputs */}
            {authMode === "signup" && selectedRole === "fleet_manager" && (
              <div className="space-y-3 pt-2 border-t border-zinc-800 animate-in fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    Enterprise / Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Global Technologies Ltd"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    Corporate Registration / RC Number
                  </label>
                  <input
                    type="text"
                    required
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="e.g. RC-1849201"
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Technician Accreditation Proof Form */}
            {authMode === "signup" && selectedRole === "technician" && (
              <div className="space-y-3.5 pt-3 border-t border-zinc-800 animate-in fade-in bg-zinc-950/40 p-4 rounded-2xl border">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    Mandatory Trade Accreditation Proof
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Technician registration is strictly vetted. Provide your repair hub trading details.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    Workshop Trading Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Micro-Soldering Hub"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    Physical Workshop Address & Cluster
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopAddress}
                    onChange={(e) => setWorkshopAddress(e.target.value)}
                    placeholder="e.g. Otigba Street, Computer Village, Ikeja"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    Trade Guild / Regulatory Body
                  </label>
                  <select
                    value={tradeAssociation}
                    onChange={(e) => setTradeAssociation(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                  >
                    <option value="CAPDAN (Computer and Allied Products Dealers)">CAPDAN (Computer & Allied Products Dealers)</option>
                    <option value="Apple Independent Repair Provider (IRP)">Apple Independent Repair Provider (IRP)</option>
                    <option value="IEEE Hardware & Consumer Technology Guild">IEEE Hardware & Consumer Technology Guild</option>
                    <option value="CAC Registered Business (RC / BN)">CAC Registered Business (RC / BN)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    License ID / Accreditation Code
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. CAPDAN-2026-V88 or IRP-NG-88912"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 block">
                    Proof Certificate or Workshop Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={proofDocumentUrl}
                    onChange={(e) => setProofDocumentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  {authMode === "signin" ? "Sign In to Registry" : "Complete Registration"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Toggle OTP Mode */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setUseOtp(!useOtp)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition font-mono"
              >
                {useOtp ? "Use standard email & password" : "Or sign in via passwordless Magic Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}