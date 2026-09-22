"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Trash2, 
  MapPin, 
  Lock, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RotateCcw,
  FileText
} from "lucide-react";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { ConsentRecord, AuditLog } from "@/lib/types/database";

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataPurged?: () => void;
}

export default function PrivacySettingsModal({
  isOpen,
  onClose,
  onDataPurged
}: PrivacySettingsModalProps) {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    refreshData();
  }, [isOpen]);

  const refreshData = () => {
    const consents = hybridStore.getConsentRecords();
    const audits = hybridStore.getAuditLogs();
    setConsentRecords(consents);
    setAuditLogs(audits);
  };

  if (!isOpen) return null;

  const locationConsent = consentRecords.find(r => r.consent_type === "LOCATION_TRACKING");
  const isLocationGranted = locationConsent?.status === "GRANTED";

  const handleToggleLocationConsent = () => {
    if (isLocationGranted) {
      hybridStore.revokeConsent("LOCATION_TRACKING");
    } else {
      hybridStore.recordConsent({
        type: "LOCATION_TRACKING",
        status: "GRANTED",
        purpose: "Active session and device deed geographic stamping.",
      });
    }
    refreshData();
  };

  const handlePurgeLocation = () => {
    if (!confirm("Are you sure you want to permanently purge all location history? This will delete all telemetry records and clear coordinate stamping from your registered devices.")) {
      return;
    }

    setIsPurging(true);
    setTimeout(() => {
      const result = hybridStore.purgeLocationHistory();
      setIsPurging(false);
      setPurgeSuccess(`Successfully purged ${result.deletedPings} telemetry records across ${result.updatedDevices} devices.`);
      refreshData();
      if (onDataPurged) onDataPurged();
      setTimeout(() => setPurgeSuccess(null), 4000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl glass-panel rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-hub-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-hub-title" className="text-lg font-bold text-white tracking-tight">
                Privacy & Data Sovereignty Hub
              </h2>
              <p className="text-xs text-white/50">Manage explicit consent, telemetry permissions, and location records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Purge Success Banner */}
        {purgeSuccess && (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{purgeSuccess}</span>
          </div>
        )}

        {/* Consent Status Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLocationGranted ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Geographic Location Permission</h3>
                <p className="text-xs text-white/50">
                  Status: <span className={isLocationGranted ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                    {isLocationGranted ? "GRANTED (Active Opt-In)" : "REVOKED / INACTIVE"}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleLocationConsent}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isLocationGranted 
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {isLocationGranted ? "Revoke Consent" : "Grant Consent"}
            </button>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            When granted, low-power telemetry coordinates are attached to your ownership records to facilitate recovery if stolen. You can revoke this at any time without impacting any core functionality.
          </p>
        </div>

        {/* Location History Purge */}
        <div className="bg-red-500/[0.03] border border-red-500/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Purge Complete Location History</h3>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Permanently delete all stored GPS coordinates, telemetry pings, and location stamps across all your registered devices. This action is cryptographically irreversible.
          </p>
          <button
            type="button"
            onClick={handlePurgeLocation}
            disabled={isPurging}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {isPurging ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isPurging ? "Purging Records..." : "Purge All Location Data Now"}
          </button>
        </div>

        {/* Audit Trail Log */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white/50" />
            <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Privacy Audit Trail (Last 5 Events)
            </h3>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-white/40 italic p-3 text-center bg-white/[0.02] rounded-lg">
                No privacy actions recorded yet.
              </p>
            ) : (
              auditLogs.slice(0, 5).map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-purple-400 text-[11px]">{log.action}</span>
                    <p className="text-[10px] text-white/40">
                      {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/40 shrink-0 ml-2">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
