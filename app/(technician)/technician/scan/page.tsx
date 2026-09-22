"use client";

import React, { useState } from "react";
import TechnicianScanner from "@/components/technician/TechnicianScanner";
import TechnicianAccreditationGate from "@/components/technician/TechnicianAccreditationGate";
import { useAuth } from "@/lib/supabase/auth-context";
import { RefreshCw } from "lucide-react";

export default function TechnicianScanPage() {
  const { user, profile, role, isLoading } = useAuth();
  const [unlocked, setUnlocked] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 font-mono text-xs text-zinc-400">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
        <span>Verifying Trade Accreditation Credentials...</span>
      </div>
    );
  }

  // Check if technician is verified
  const isVerifiedTechnician = 
    unlocked || 
    (role === "technician" && profile?.technician_profile?.accreditation_status === "VERIFIED");

  if (!isVerifiedTechnician) {
    return (
      <div className="py-4 px-2 sm:px-4">
        <TechnicianAccreditationGate onVerifiedSuccess={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="py-4 px-2 sm:px-4">
      <TechnicianScanner />
    </div>
  );
}
