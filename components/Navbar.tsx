"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  QrCode, 
  Smartphone, 
  Search, 
  User, 
  Wrench, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, switchRole, user } = useAuth();

  const navLinks = [
    { href: "/technician/scan", label: "Technician Hub", icon: QrCode },
    { href: "/dashboard/devices", label: "Owner Registry", icon: Smartphone },
    { href: "/verify", label: "Public Search", icon: Search },
  ];

  return (
    <header className="sticky top-3 z-40 px-4 sm:px-6 max-w-7xl mx-auto w-full no-print">
      <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl shadow-black/40">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 text-black flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-inner group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-4 h-4 fill-black stroke-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs tracking-wider uppercase text-zinc-100">
              RupalShield
            </span>
            <span className="text-[9px] tracking-wider text-zinc-400 uppercase font-mono">
              Defense Registry
            </span>
          </div>
        </Link>

        {/* Desktop Nav - Floating Pill Items */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Role Badge & Profile */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cupertino Role Toggle Pill */}
          <button
            onClick={() => switchRole(role === "technician" ? "owner" : "technician")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-300 transition-colors"
            title="Click to toggle demo role"
          >
            {role === "technician" ? (
              <>
                <Wrench className="w-3 h-3 text-emerald-400" />
                <span className="text-zinc-200">Tech Portal</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-sky-400" />
                <span className="text-zinc-200">Owner View</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-zinc-400 opacity-60 ml-0.5" />
          </button>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span>{user ? "Account" : "Sign In"}</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-panel rounded-2xl p-4 space-y-2 text-xs shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow"
                    : "text-zinc-300 hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                switchRole(role === "technician" ? "owner" : "technician");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800"
            >
              <span className="flex items-center gap-2">
                {role === "technician" ? <Wrench className="w-3.5 h-3.5 text-emerald-400" /> : <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
                Role: {role.toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-400 underline">Tap to Switch</span>
            </button>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold"
            >
              <User className="w-4 h-4" />
              <span>{user ? "My Profile" : "Sign In / Register"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
