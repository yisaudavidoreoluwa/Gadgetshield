"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Zap, Shield, Sparkles } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already installed in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check if user dismissed recently (within 7 days)
      const dismissedAt = localStorage.getItem("rupalshield_pwa_dismissed");
      if (dismissedAt) {
        const diff = Date.now() - parseInt(dismissedAt, 10);
        if (diff < 7 * 24 * 60 * 60 * 1000) {
          return;
        }
      }

      // Register Service Worker if supported
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .catch(() => {});
      }

      // Listen for browser install prompt
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      window.addEventListener("appinstalled", () => {
        setIsVisible(false);
        setIsInstalled(true);
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("rupalshield_pwa_dismissed", Date.now().toString());
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-40 animate-fade-in">
      <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl relative space-y-4 bg-zinc-950/90 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Install Gadgetshield App
                </h4>
                <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-mono">
                  Optional
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Enhance your device security with offline capabilities
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Practical Benefits (Never forced) */}
        <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px]">
          <div className="flex items-center gap-2 text-white/80">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>Offline Deed Access:</strong> View cryptographically verified ownership QR deeds even without internet.</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong>1-Tap Emergency Lockdown:</strong> Immediate theft reporting icon from your home screen.</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span><strong>Zero Clutter:</strong> Full-screen standalone view with no browser address bar.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs font-medium transition hover:bg-white/5 text-center"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
