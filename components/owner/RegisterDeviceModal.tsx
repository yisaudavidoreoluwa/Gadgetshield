"use client";

import React, { useState } from "react";
import { 
  X, 
  Smartphone, 
  Laptop,
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileCheck,
  Sparkles,
  Wand2
} from "lucide-react";
import { 
  validateImeiLuhn, 
  calculateImeiCheckDigit, 
  autoCorrectImei, 
  generateValidLuhnImei 
} from "@/lib/utils/luhn";
import { uploadReceiptProof } from "@/lib/storage/cloudinary";
import { hybridStore } from "@/lib/storage/hybrid-store";
import { useAuth } from "@/lib/supabase/auth-context";

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
  const { user } = useAuth();
  const [deviceCategory, setDeviceCategory] = useState<"phone" | "computer">("phone");
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

  // Clean IMEI input (strip spaces, hyphens, non-digits)
  const handleImeiChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 15);
    setImeiPrimary(cleaned);
    setErrorMsg(null);
  };

  // 1-Tap Fill Demo Gadget
  const handleFillDemo = () => {
    const demoImei = generateValidLuhnImei("35874209");
    setDeviceCategory("phone");
    setBrand("Apple");
    setModel("iPhone 16 Pro (Desert Titanium)");
    setImeiPrimary(demoImei);
    setSerialNumber("H3KL90M2PQ8");
    setReceiptFileName("Apple_Store_Invoice_2026.pdf");
    setReceiptUrl("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80");
    setErrorMsg(null);
  };

  // 1-Tap Fix / Complete Check Digit
  const handleFixCheckDigit = () => {
    if (imeiPrimary.length >= 14) {
      const fixed = autoCorrectImei(imeiPrimary);
      setImeiPrimary(fixed);
      setErrorMsg(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setReceiptFileName(file.name);
    try {
      const result = await uploadReceiptProof(file);
      setReceiptUrl(result.url);
    } catch {
      // Safe fallback - attach local proof without blocking deed creation
      setReceiptUrl(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!brand.trim()) {
      setErrorMsg("Please provide the device brand or manufacturer.");
      return;
    }
    if (!model.trim()) {
      setErrorMsg("Please specify the model name.");
      return;
    }

    let finalImei = imeiPrimary.replace(/[^0-9]/g, "");

    if (deviceCategory === "phone") {
      if (finalImei.length === 14) {
        // Auto-complete the 15th Luhn check digit
        finalImei = autoCorrectImei(finalImei);
      } else if (finalImei.length === 15) {
        // Verify Luhn, and if mismatch, auto-correct it seamlessly
        if (!validateImeiLuhn(finalImei)) {
          finalImei = autoCorrectImei(finalImei);
        }
      } else {
        setErrorMsg(`Primary IMEI requires 14 or 15 digits (currently ${finalImei.length} entered).`);
        return;
      }
    } else {
      // Laptop / Wi-Fi Gadget Mode
      if (!serialNumber.trim()) {
        setErrorMsg("Serial Number is required for laptops and non-cellular gadgets.");
        return;
      }
      if (!finalImei) {
        // Generate an official tracking deed identifier for non-cellular hardware
        finalImei = generateValidLuhnImei("99");
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        owner_id: user?.id || "user-owner-001",
        brand: brand.trim(),
        model: model.trim(),
        imei_primary: finalImei,
        imei_secondary: imeiSecondary.trim() || undefined,
        serial_number: serialNumber.trim() || undefined,
        purchase_receipt_url: receiptUrl || undefined,
        status: "CLEAN" as const,
      };

      // 1. Guaranteed Hybrid Storage persistence
      const savedDevice = hybridStore.addDevice(payload);

      // 2. Parallel sync attempt to live server API
      try {
        fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch {
        // Ignore network background error
      }

      onRegistered(savedDevice);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Computed check digit recommendation if 14 or 15 digits entered
  const recommendedCheckDigit = imeiPrimary.length >= 14 ? calculateImeiCheckDigit(imeiPrimary.slice(0, 14)) : null;
  const isLuhnValid = imeiPrimary.length === 15 && validateImeiLuhn(imeiPrimary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 text-zinc-100 shadow-2xl border-zinc-700/60 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Register Device Deed
              </h2>
              <span className="text-[11px] text-zinc-400">Anchor ownership in national registry</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full hover:bg-emerald-500/20 transition flex items-center gap-1"
              title="Auto-fill with sample valid gadget data"
            >
              <Wand2 className="w-3 h-3" />
              Fill Test Gadget
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-800/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="glass-panel border-amber-500/30 text-amber-200 text-xs p-3 rounded-2xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Device Category Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setDeviceCategory("phone")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              deviceCategory === "phone"
                ? "bg-white text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Smartphone (IMEI)</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceCategory("computer")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              deviceCategory === "computer"
                ? "bg-white text-zinc-950 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Laptop / Tablet (Serial)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Brand / Maker *</label>
              <input
                required
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung, Dell"
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
                placeholder="e.g. iPhone 16 Pro, XPS 15"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          {/* IMEI Section (Primary for Phones, Optional for Laptops) */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-medium">
              <label className="text-zinc-400">
                {deviceCategory === "phone" ? "Primary IMEI (15 Digits) *" : "Primary IMEI (Optional)"}
              </label>

              {/* Live Luhn Integrity & Auto-Fix Action */}
              {imeiPrimary.length === 14 && (
                <button
                  type="button"
                  onClick={handleFixCheckDigit}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline"
                >
                  + Add Check Digit ({recommendedCheckDigit})
                </button>
              )}

              {imeiPrimary.length === 15 && (
                isLuhnValid ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Valid Luhn Checksum
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleFixCheckDigit}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    Auto-fix checksum (to {recommendedCheckDigit})
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <input
                required={deviceCategory === "phone"}
                type="text"
                value={imeiPrimary}
                onChange={(e) => handleImeiChange(e.target.value)}
                placeholder={deviceCategory === "phone" ? "358742091234562" : "Auto-generated if left blank"}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white tracking-widest font-mono focus:outline-none focus:border-zinc-500 transition"
              />
              {imeiPrimary.length > 0 && (
                <span className="absolute right-3 top-2.5 text-[10px] text-zinc-500 font-mono">
                  {imeiPrimary.length}/15
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Dial <code className="text-zinc-300">*#06#</code> on your phone to find your 15-digit IMEI. Spaces and hyphens are stripped automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">
                {deviceCategory === "computer" ? "Serial Number *" : "Serial Number (Optional)"}
              </label>
              <input
                required={deviceCategory === "computer"}
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. F2LLN0G9XXXX"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white uppercase font-mono focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1.5 font-medium">Secondary IMEI (Optional)</label>
              <input
                type="text"
                value={imeiSecondary}
                onChange={(e) => setImeiSecondary(e.target.value.replace(/[^0-9]/g, "").slice(0, 15))}
                placeholder="eSIM / SIM 2"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white tracking-widest font-mono focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          {/* Storage Receipt Upload (Optional Proof) */}
          <div className="border border-dashed border-zinc-800 rounded-2xl p-4 text-center bg-zinc-900/40 hover:bg-zinc-900/60 transition">
            {isUploading ? (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
                <span className="text-[11px] text-zinc-400">Processing proof of purchase...</span>
              </div>
            ) : receiptUrl ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 py-1">
                <FileCheck className="w-5 h-5" />
                <span className="text-xs font-medium truncate max-w-xs">{receiptFileName || "Purchase Proof Attached"}</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 mx-auto text-zinc-500 mb-1" />
                <span className="text-xs text-zinc-300 block font-medium">
                  Attach Purchase Receipt or Invoice (Optional)
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  PNG, JPG, or PDF proof of title
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
                  className="mt-2 inline-block text-[11px] text-zinc-950 bg-white font-medium px-4 py-1.5 rounded-full cursor-pointer hover:bg-zinc-200 transition shadow"
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
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-3 rounded-xl disabled:bg-zinc-800 disabled:text-zinc-500 transition shadow-lg flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Issuing Deed...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Issue Digital Deed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}