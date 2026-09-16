"use client";

import React, { useState } from "react";
import { X, Smartphone, Upload, CheckCircle2, AlertCircle, RefreshCw, FileCheck } from "lucide-react";
import { validateImeiLuhn } from "@/lib/utils/luhn";
import { uploadReceiptProof } from "@/lib/storage/cloudinary";

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
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setReceiptFileName(file.name);
    try {
      const result = await uploadReceiptProof(file);
      setReceiptUrl(result.url);
    } catch (err: any) {
      setErrorMsg("Receipt upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
        purchase_receipt_url: receiptUrl,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 text-zinc-100 shadow-2xl border-zinc-700/60 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Register Device Deed
              </h2>
              <span className="text-[11px] text-zinc-400">Anchor ownership in the national registry</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="glass-panel border-amber-500/30 text-amber-200 text-xs p-3 rounded-2xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Brand / Maker *</label>
              <input
                required
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Google"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Model Designation *</label>
              <input
                required
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. iPhone 15 Pro"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 font-medium">
              <label className="text-zinc-400">Primary IMEI (15 Digits) *</label>
              {imeiPrimary.length === 15 && (
                <span className="text-[10px]">
                  {validateImeiLuhn(imeiPrimary) ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" /> Valid Luhn
                    </span>
                  ) : (
                    <span className="text-zinc-400">Luhn Mismatch</span>
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
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white tracking-widest font-mono focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Secondary IMEI (Optional)</label>
              <input
                type="text"
                maxLength={15}
                value={imeiSecondary}
                onChange={(e) => setImeiSecondary(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="eSIM / SIM 2"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white tracking-widest font-mono focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Serial Number (Optional)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. F2LLN0G9XXXX"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white uppercase font-mono focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          {/* Cloudinary / Storage Receipt Upload */}
          <div className="border border-dashed border-zinc-800 rounded-2xl p-4 text-center bg-zinc-900/40 hover:bg-zinc-900/60 transition">
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
                <span className="text-[11px] text-zinc-400">Uploading invoice proof to secure storage...</span>
              </div>
            ) : receiptUrl ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 py-1">
                <FileCheck className="w-5 h-5" />
                <span className="text-xs font-medium truncate max-w-xs">{receiptFileName}</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto text-zinc-500 mb-1.5" />
                <span className="text-xs text-zinc-300 block font-medium">
                  Upload Purchase Invoice or Store Receipt
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  PNG, JPG, or PDF up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  id="receipt-file-input"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="receipt-file-input"
                  className="mt-2.5 inline-block text-xs text-zinc-950 bg-white font-medium px-4 py-1.5 rounded-full cursor-pointer hover:bg-zinc-200 transition shadow"
                >
                  Choose File
                </label>
              </>
            )}
          </div>

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
              disabled={isSubmitting || imeiPrimary.length !== 15 || isUploading}
              className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-3 rounded-xl disabled:bg-zinc-800 disabled:text-zinc-500 transition shadow-lg flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Issue Digital Deed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
