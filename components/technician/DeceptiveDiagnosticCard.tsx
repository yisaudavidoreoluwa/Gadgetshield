"use client";

import React from "react";
import { Cpu, CheckCircle2, Lock, FileText, XCircle } from "lucide-react";

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
    <div className="border border-neutral-700 bg-neutral-950 p-5 rounded-lg flex flex-col gap-4 font-mono shadow-2xl">
      {/* Deceptive Neutral Diagnostic Card Header (Zero Customer Alarm) */}
      <div className="border-b border-neutral-800 pb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neutral-300" />
            <span className="text-[11px] font-semibold text-neutral-200 uppercase tracking-wider">
              Hardware Diagnostic Utility // OEM-Check
            </span>
          </div>
          <h3 className="text-sm font-sans font-medium text-white mt-1">
            Original Parts Stock Not Available
          </h3>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono border border-neutral-800 px-1.5 py-0.5 rounded">
          CODE: DIAG-409B
        </span>
      </div>

      {/* Fake OEM Technical Readout (Customer Over-the-counter view) */}
      <div className="bg-black border border-neutral-800 p-3.5 rounded text-[11px] space-y-2 text-neutral-400">
        <div className="flex justify-between border-b border-neutral-900 pb-1">
          <span>Model Identification:</span>
          <span className="text-neutral-200 font-semibold">{brand || "Universal"} {model || "Platform"}</span>
        </div>
        <div className="flex justify-between border-b border-neutral-900 pb-1">
          <span>Motherboard Subsystem:</span>
          <span className="text-neutral-300">Rev 4.2B (Power Rail B12 Impedance High)</span>
        </div>
        <div className="flex justify-between border-b border-neutral-900 pb-1">
          <span>Component Allocation:</span>
          <span className="text-neutral-300">Central Depot Dispatch Required (48-72h)</span>
        </div>
        <div className="flex justify-between pt-0.5">
          <span>Recommended Action:</span>
          <span className="text-white font-medium">Bench Soak Intake Docket</span>
        </div>
      </div>

      {/* Discreet Technician Exoneration Section */}
      <div className="border-t border-neutral-900 pt-3">
        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1.5">
          <span className="flex items-center gap-1 text-neutral-300 font-semibold">
            <Lock className="w-3 h-3 text-white" /> CLEAN HANDS EXONERATION ACTIVE
          </span>
          <span className="font-mono text-neutral-400">
            TOKEN: {cleanHandsToken.slice(0, 8)}...{cleanHandsToken.slice(-4)}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-tight">
          Incident location, GPS coordinates, and timestamp securely recorded in registry. You are legally protected under the Good Faith Service Act.
        </p>
      </div>

      {/* Technician Decision Buttons (Discreet) */}
      {!actionTaken ? (
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={onHoldDiagnostic}
            className="flex-1 bg-white hover:bg-neutral-200 text-black text-xs font-sans font-semibold py-2.5 px-3 rounded transition flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            Hold for Bench Diagnostic
          </button>
          <button
            onClick={onDeclineService}
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-sans font-medium py-2.5 px-3 rounded transition flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            Decline Service - Incompatible Board
          </button>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-200 font-sans font-medium">
            <CheckCircle2 className="w-4 h-4 text-white" />
            Protocol Action Logged: <strong className="text-white font-mono">{actionTaken}</strong>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            Silent alert confirmed by registry. Incident logged safely without counter alert.
          </p>
        </div>
      )}
    </div>
  );
}
