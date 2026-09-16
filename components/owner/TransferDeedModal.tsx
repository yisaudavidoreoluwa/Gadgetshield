"use client";

import React, { useState } from "react";
import { X, ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-mono text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Transfer Ownership Deed
            </h2>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs p-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="bg-black border border-neutral-800 p-3 rounded text-xs mb-4 space-y-1">
          <div className="text-neutral-400">Target Device:</div>
          <div className="text-white font-semibold">{device.brand} {device.model}</div>
          <div className="text-neutral-400 font-mono text-[11px]">{formatImei(device.imei_primary)}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">
              Recipient Email or Phone Number *
            </label>
            <input
              required
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. buyer@example.com or +1234567890"
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              The recipient will receive a cryptographic deed claim token to complete handoff.
            </span>
          </div>

          <label className="flex items-start gap-2 bg-neutral-900/50 p-2.5 rounded border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmTransfer}
              onChange={(e) => setConfirmTransfer(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 bg-black text-white focus:ring-0"
            />
            <span className="text-[11px] text-neutral-300">
              I certify that I am legitimately transferring ownership of this electronics hardware and will relinquish all registry claims.
            </span>
          </label>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 py-2.5 rounded hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !recipient || !confirmTransfer}
              className="flex-1 bg-white text-black font-semibold py-2.5 rounded hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Transfer Deed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
