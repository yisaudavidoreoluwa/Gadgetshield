"use client";

import React from "react";
import { ShieldCheck, MapPin, Lock, Clock, Eye, AlertCircle, X } from "lucide-react";

interface LocationConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onDecline: () => void;
  title?: string;
  contextMessage?: string;
}

export default function LocationConsentModal({
  isOpen,
  onConsent,
  onDecline,
  title = "Location Permission & Privacy Disclosure",
  contextMessage = "To cryptographically bind your verified geographic coordinates to this device's Deed of Ownership, we require your explicit consent.",
}: LocationConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg glass-panel rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="consent-title" className="text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
              <p className="text-xs text-white/50">GDPR & NDPR Compliant User Sovereignty</p>
            </div>
          </div>
          <button
            onClick={onDecline}
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Purpose Explanation */}
        <p className="text-sm text-white/80 leading-relaxed">
          {contextMessage}
        </p>

        {/* Detailed Disclosure Matrix */}
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white/90">Data Collected:</span>
              <p className="text-white/60 mt-0.5">High-accuracy GPS latitude, longitude, radius accuracy, and local device timestamp.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white/90">Purpose:</span>
              <p className="text-white/60 mt-0.5">Establishing physical possession custody and enabling rapid coordinate dispatch in police theft dockets.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white/90">Retention & Control:</span>
              <p className="text-white/60 mt-0.5">Retained strictly until you purge your history. You can revoke consent or scrub all coordinates with 1-click in Privacy Controls at any time.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white/90">Access Restrictions:</span>
              <p className="text-white/60 mt-0.5">Protected by Row Level Security (RLS). Visible strictly to you as the registered owner and verified investigating authorities if reported stolen.</p>
            </div>
          </div>
        </div>

        {/* Graceful Denial Notice */}
        <div className="flex items-center gap-2 text-xs text-white/40 bg-white/5 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-white/30 shrink-0" />
          <span>If you decline, your device will still be registered cleanly without attaching geographic telemetry.</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onDecline}
            className="w-full py-3 px-4 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 font-medium text-xs transition-colors"
          >
            Decline & Continue Without Location
          </button>
          <button
            type="button"
            onClick={onConsent}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <MapPin className="w-4 h-4" />
            Consent & Acquire Location
          </button>
        </div>
      </div>
    </div>
  );
}
