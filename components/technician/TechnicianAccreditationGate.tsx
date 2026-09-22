"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Wrench, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  AlertTriangle,
  Upload,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { TechnicianProfile, TechnicianAccreditationStatus } from "@/lib/types/database";

interface TechnicianAccreditationGateProps {
  onVerifiedSuccess?: () => void;
}

export default function TechnicianAccreditationGate({ onVerifiedSuccess }: TechnicianAccreditationGateProps) {
  const { user, profile, submitTechnicianAccreditation, refreshProfile } = useAuth();

  const currentStatus: TechnicianAccreditationStatus = 
    profile?.technician_profile?.accreditation_status || "UNACCREDITED";

  // Form states
  const [shopName, setShopName] = useState(profile?.technician_profile?.shop_name || profile?.shop_name || "");
  const [workshopAddress, setWorkshopAddress] = useState(profile?.technician_profile?.workshop_address || profile?.market_location || "");
  const [tradeAssociation, setTradeAssociation] = useState(profile?.technician_profile?.trade_association || "CAPDAN (Computer and Allied Products Dealers)");
  const [licenseNumber, setLicenseNumber] = useState(profile?.technician_profile?.license_number || "");
  const [proofUrl, setProofUrl] = useState(profile?.technician_profile?.proof_document_url || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!shopName.trim() || !workshopAddress.trim() || !licenseNumber.trim()) {
      setErrorMsg("Please provide your workshop trading name, street address, and trade guild license number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { profile: updated, error } = await submitTechnicianAccreditation({
        shop_name: shopName.trim(),
        workshop_address: workshopAddress.trim(),
        trade_association: tradeAssociation.trim(),
        license_number: licenseNumber.trim(),
        proof_document_url: proofUrl.trim() || undefined,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to submit accreditation details.");
      } else {
        await refreshProfile();
        if (updated?.technician_profile?.accreditation_status === "VERIFIED") {
          setSuccessMsg("Trade Guild Accreditation Validated! Your Dealer Console is now unlocked.");
          if (onVerifiedSuccess) {
            setTimeout(() => onVerifiedSuccess(), 1000);
          }
        } else {
          setSuccessMsg("Accreditation proof submitted successfully. Under active review by Guild Board.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fastTrackFill = (code: string, guild: string) => {
    setLicenseNumber(code);
    setTradeAssociation(guild);
    if (!shopName) setShopName("Metro Micro-Soldering & Hardware Lab");
    if (!workshopAddress) setWorkshopAddress("Otigba Street, Computer Village, Ikeja, Lagos");
    if (!proofUrl) setProofUrl("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800");
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/devices"
          className="glass-pill text-xs text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Personal Registry
        </Link>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
          <Lock className="w-3 h-3" /> Privileged Console
        </span>
      </div>

      {/* Authority Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent space-y-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              STATUTORY RESTRICTION // DEALER FORENSIC HUB
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Certified Technician Accreditation Required
            </h1>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed pt-1">
          Pursuant to secondary electronics trade regulations and statutory anti-fencing acts, the Technician Scanner, Stealth Diagnostic Counter, and Clean Hands Immunity Tokens are restricted exclusively to accredited electronics repair technicians and registered secondhand gadget dealers.
        </p>

        {/* Current Status Badge */}
        <div className="pt-2 flex items-center gap-2">
          {currentStatus === "PENDING_ACCREDITATION" ? (
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Accreditation Status: PENDING TRADE GUILD REVIEW</span>
            </div>
          ) : (
            <div className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-xl font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-400" />
              <span>Accreditation Status: UNVERIFIED ACCOUNT</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="glass-panel border-red-500/50 bg-red-500/10 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="glass-panel border-emerald-500/50 bg-emerald-500/10 text-emerald-300 p-4 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Accreditation Submission Form */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 border-zinc-700/60 shadow-xl">
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-300" />
            Submit Proof of Repair Hub Accreditation
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Provide your workshop credentials or trade association license number.
          </p>
        </div>

        {/* Field 1: Workshop Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-zinc-400 block">
            1. Workshop / Business Trading Name
          </label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Apex Micro-Soldering & Gadget Diagnostics"
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
          />
        </div>

        {/* Field 2: Physical Workshop Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-zinc-400 block">
            2. Physical Workshop Address & Electronics Cluster
          </label>
          <input
            type="text"
            required
            value={workshopAddress}
            onChange={(e) => setWorkshopAddress(e.target.value)}
            placeholder="e.g. Shop 14, Otigba Street, Computer Village, Ikeja, Lagos"
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
          />
        </div>

        {/* Field 3: Trade Guild Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-zinc-400 block">
            3. Accrediting Trade Association or Guild
          </label>
          <select
            value={tradeAssociation}
            onChange={(e) => setTradeAssociation(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
          >
            <option value="CAPDAN (Computer and Allied Products Dealers)">CAPDAN (Computer and Allied Products Dealers Association)</option>
            <option value="Apple Independent Repair Provider (IRP)">Apple Independent Repair Provider (IRP)</option>
            <option value="IEEE Hardware & Consumer Technology Guild">IEEE Hardware & Consumer Technology Guild</option>
            <option value="State Electronics Technicians Association">State Electronics Technicians Association</option>
            <option value="CAC Registered Electronics Business (RC / BN)">CAC Registered Electronics Business (RC / BN)</option>
          </select>
        </div>

        {/* Field 4: Guild License / Accreditation ID */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase text-zinc-400 block">
              4. License / Accreditation ID Number
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              e.g. CAPDAN-2026-..., IRP-NG-..., CAC-...
            </span>
          </div>
          <input
            type="text"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="Enter license or guild membership ID"
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white font-mono tracking-wider focus:outline-none focus:border-zinc-500 transition"
          />
        </div>

        {/* Field 5: Proof Document URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-zinc-400 block">
            5. Document Proof Link or Workshop Frontage Photo URL (Optional)
          </label>
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://... (Link to CAC Certificate, Guild ID card, or workshop photo)"
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-zinc-500 transition"
          />
        </div>

        {/* Fast-Track Testing Shortcuts for Demo / Testing */}
        <div className="pt-2 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/80 space-y-2 text-[11px]">
          <span className="font-mono text-zinc-400 uppercase tracking-wider block">
            Fast-Track Accreditation Testing Tokens:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fastTrackFill("CAPDAN-2026-V88", "CAPDAN (Computer and Allied Products Dealers)")}
              className="glass-pill px-2.5 py-1 rounded-lg text-emerald-400 font-mono text-[10px] hover:bg-zinc-800 transition"
            >
              + CAPDAN-2026-V88
            </button>
            <button
              type="button"
              onClick={() => fastTrackFill("IRP-NG-88912", "Apple Independent Repair Provider (IRP)")}
              className="glass-pill px-2.5 py-1 rounded-lg text-sky-400 font-mono text-[10px] hover:bg-zinc-800 transition"
            >
              + IRP-NG-88912
            </button>
            <button
              type="button"
              onClick={() => fastTrackFill("CAC-BN-99201", "CAC Registered Electronics Business (RC / BN)")}
              className="glass-pill px-2.5 py-1 rounded-lg text-amber-400 font-mono text-[10px] hover:bg-zinc-800 transition"
            >
              + CAC-BN-99201
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 transition shadow-lg disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Validating Guild Accreditation...
            </>
          ) : (
            <>
              Submit Accreditation & Verify Access
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
