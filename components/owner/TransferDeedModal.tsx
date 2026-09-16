"use client";

import React, { useState } from "react";
import { X, ArrowRightLeft, AlertCircle, RefreshCw } from "lucide-react";
import { formatImei } from "@/lib/utils/formatters";

interface TransferDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    id: string;
    brand: string;
    model: string;
    imei_primary: string;
  };
  onTransferred: (deviceId: string, recipient: string) => void;
}

export default function TransferDeedModal({
  isOpen,
  onClose,
  device,
  onTransferred,
}: TransferDeedModalProps) {
  const [recipient, setRecipient] = useState("");
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmTransfer) {
      setErrorMsg("Please acknowledge the legal transfer of ownership.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/devices/${device.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientContact: recipient.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to transfer deed.");
      }

      onTransferred(device.id, recipient);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate deed transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-7 text-zinc-100 shadow-2xl border-zinc-700/60">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Transfer Ownership Deed
              </h2>
              <span className="text-[11px] text-zinc-400">Cryptographic deed re-assignment</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800/60 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="glass-panel border-amber-500/30 text-amber-200 text-xs p-3 rounded-2xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 text-xs mb-4 space-y-1">
          <div className="text-zinc-400 font-medium">Target Hardware:</div>
          <div className="text-white font-semibold text-sm">{device.brand} {device.model}</div>
          <div className="text-zinc-400 font-mono text-[11px]">{formatImei(device.imei_primary)}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">
              Recipient Email or Phone Number *
            </label>
            <input
              required
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. buyer@example.com or +1234567890"
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
            />
            <span className="text-[10px] text-zinc-400 mt-1 block">
              The recipient will receive an encrypted deed claim token to complete handoff.
            </span>
          </div>

          <label className="flex items-start gap-2.5 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-900/70 transition">
            <input
              type="checkbox"
              checked={confirmTransfer}
              onChange={(e) => setConfirmTransfer(e.target.checked)}
              className="mt-0.5 rounded border-zinc-700 bg-zinc-950 text-white focus:ring-0"
            />
            <span className="text-[11px] text-zinc-300 leading-snug">
              I certify that I am legitimately transferring legal title to this electronics hardware and will relinquish all registry claims.
            </span>
          </label>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass-pill text-zinc-300 py-3 rounded-xl hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !recipient || !confirmTransfer}
              className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-3 rounded-xl disabled:bg-zinc-800 disabled:text-zinc-500 transition shadow-lg flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Transfer Deed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
