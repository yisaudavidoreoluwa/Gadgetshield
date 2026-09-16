"use client";

import React from "react";
import { Cpu, CheckCircle2, Lock, FileText, XCircle, Wrench } from "lucide-react";

interface DeceptiveDiagnosticCardProps {
  brand?: string;
  model?: string;
  cleanHandsToken: string;
  onHoldDiagnostic: () => void;
  onDeclineService: () => void;
  actionTaken: string | null;
}

export default function DeceptiveDiagnosticCard({
  brand,
  model,
  cleanHandsToken,
  onHoldDiagnostic,
  onDeclineService,
  actionTaken,
}: DeceptiveDiagnosticCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 shadow-2xl border-zinc-700/60">
      {/* Deceptive Neutral Diagnostic Card Header (Zero Customer Alarm) */}
      <div className="border-b border-zinc-800/80 pb-3 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Hardware Diagnostic Utility // OEM-Check
            </span>
          </div>
          <h3 className="text-sm font-medium text-white">
            Original Parts Stock Not Available
          </h3>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono glass-pill px-2 py-0.5 rounded-full">
          CODE: DIAG-409B
        </span>
      </div>

      {/* Fake OEM Technical Readout (Customer Over-the-counter view) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 text-xs space-y-2 text-zinc-400">
        <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
          <span>Model Identification:</span>
          <span className="text-zinc-200 font-medium">{brand || "Universal"} {model || "Platform"}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
          <span>Motherboard Subsystem:</span>
          <span className="text-zinc-300 font-mono text-[11px]">Rev 4.2B (Power Rail B12 Impedance High)</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
          <span>Component Allocation:</span>
          <span className="text-zinc-300">Central Depot Dispatch Required (48-72h)</span>
        </div>
        <div className="flex justify-between pt-0.5">
          <span>Recommended Action:</span>
          <span className="text-white font-medium">Bench Soak Intake Required</span>
        </div>
      </div>

      {/* Discreet Technician Exoneration Section */}
      <div className="border-t border-zinc-800/80 pt-3">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
          <span className="flex items-center gap-1.5 text-zinc-200 font-medium">
            <Lock className="w-3 h-3 text-emerald-400" /> CLEAN HANDS EXONERATION ACTIVE
          </span>
          <span className="font-mono text-zinc-400 glass-pill px-2 py-0.5 rounded-full">
            TOKEN: {cleanHandsToken.slice(0, 8)}...{cleanHandsToken.slice(-4)}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 leading-tight">
          Incident location, GPS coordinates, and timestamp securely recorded in registry. You are legally protected under the Good Faith Service Act.
        </p>
      </div>

      {/* Technician Decision Buttons (Discreet) */}
      {!actionTaken ? (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onHoldDiagnostic}
            className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <FileText className="w-3.5 h-3.5" />
            Hold for Bench Diagnostic
          </button>
          <button
            onClick={onDeclineService}
            className="flex-1 glass-pill text-zinc-300 hover:text-white text-xs font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline Service - Incompatible Board
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-3.5 text-center border-zinc-700/60">
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Protocol Action Logged: <strong className="text-white font-mono ml-1">{actionTaken}</strong>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Silent alert confirmed by registry. Incident logged safely without counter alert.
          </p>
        </div>
      )}
    </div>
  );
}
