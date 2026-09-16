"use client";

import React, { useState } from "react";
import { X, Smartphone, Upload, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { validateImeiLuhn } from "@/lib/utils/luhn";

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newDevice: any) => void;
}

export default function RegisterDeviceModal({
  isOpen,
  onClose,
  onRegistered,
}: RegisterDeviceModalProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [imeiPrimary, setImeiPrimary] = useState("");
  const [imeiSecondary, setImeiSecondary] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [receiptFileName, setReceiptFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanImei1 = imeiPrimary.replace(/[^0-9]/g, "");
    if (cleanImei1.length !== 15) {
      setErrorMsg("Primary IMEI must be exactly 15 digits.");
      return;
    }
    if (!validateImeiLuhn(cleanImei1)) {
      setErrorMsg("Primary IMEI failed Luhn check digit verification.");
      return;
    }

    if (imeiSecondary) {
      const cleanImei2 = imeiSecondary.replace(/[^0-9]/g, "");
      if (cleanImei2.length !== 15 || !validateImeiLuhn(cleanImei2)) {
        setErrorMsg("Secondary IMEI must be a valid 15-digit Luhn number.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        brand: brand.trim(),
        model: model.trim(),
        imei_primary: cleanImei1,
        imei_secondary: imeiSecondary.trim() || null,
        serial_number: serialNumber.trim() || null,
        purchase_receipt_url: receiptFileName ? `https://storage.rupalshield.io/receipts/${receiptFileName}` : null,
      };

      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register device.");
      }

      const created = await res.json();
      onRegistered(created);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-mono text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-white" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              Register Device Deed
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs p-3 rounded mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Brand / Maker *</label>
              <input
                required
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung"
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Model Name / Number *</label>
              <input
                required
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. iPhone 15 Pro, S24"
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] text-neutral-400">Primary IMEI (15 Digits) *</label>
              {imeiPrimary.length === 15 && (
                <span className="text-[10px]">
                  {validateImeiLuhn(imeiPrimary) ? (
                    <span className="text-neutral-300 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-white inline" /> Valid Luhn
                    </span>
                  ) : (
                    <span className="text-neutral-500">Luhn Mismatch</span>
                  )}
                </span>
              )}
            </div>
            <input
              required
              type="text"
              maxLength={15}
              value={imeiPrimary}
              onChange={(e) => setImeiPrimary(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="358742091234567"
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white tracking-widest focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Secondary IMEI (Optional)</label>
              <input
                type="text"
                maxLength={15}
                value={imeiSecondary}
                onChange={(e) => setImeiSecondary(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="eSIM or SIM 2"
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white tracking-widest focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Serial Number (Optional)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. F2LLN0G9XXXX"
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white uppercase focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Receipt Proof Upload (Cloudinary / Supabase placeholder) */}
          <div className="border border-dashed border-neutral-800 rounded-lg p-3 text-center bg-black">
            <Upload className="w-5 h-5 mx-auto text-neutral-500 mb-1" />
            <span className="text-[11px] text-neutral-400 block">
              {receiptFileName ? receiptFileName : "Upload Purchase Invoice / Receipt Proof"}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              id="receipt-file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setReceiptFileName(file.name);
              }}
            />
            <label
              htmlFor="receipt-file"
              className="mt-2 inline-block text-[10px] text-black bg-white px-3 py-1 rounded cursor-pointer hover:bg-neutral-200 transition"
            >
              Browse Proof
            </label>
          </div>

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
              disabled={isSubmitting || imeiPrimary.length !== 15}
              className="flex-1 bg-white text-black font-semibold py-2.5 rounded hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Issue Digital Deed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
