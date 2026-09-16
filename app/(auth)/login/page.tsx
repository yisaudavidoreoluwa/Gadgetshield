"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Smartphone, Wrench, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "technician">("technician");
  const [email, setEmail] = useState("");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "technician") {
      router.push("/technician/scan");
    } else {
      router.push("/dashboard/devices");
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 font-mono">
      <div className="border border-neutral-800 bg-neutral-950 p-6 rounded-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded bg-white text-black flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-base font-bold uppercase tracking-wider text-white">
            RupalShield Access Terminal
          </h1>
          <p className="text-xs text-neutral-400 font-sans">
            Sign in with email OTP or magic link
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-lg border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setRole("technician")}
            className={`py-2 rounded flex items-center justify-center gap-1.5 transition ${
              role === "technician" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Technician
          </button>
          <button
            type="button"
            onClick={() => setRole("owner")}
            className={`py-2 rounded flex items-center justify-center gap-1.5 transition ${
              role === "owner" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Owner
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@repairhub.io"
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
            />
          </div>

          {role === "technician" && (
            <>
              <div>
                <label className="block text-neutral-400 mb-1">Repair Hub / Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Apex Micro-Soldering Hub"
                  className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Market Cluster Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Computer Village Slot 14"
                  className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-2.5 rounded transition flex items-center justify-center gap-1.5"
          >
            Authenticate Session
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
