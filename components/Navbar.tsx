"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Shield, 
  QrCode, 
  Smartphone, 
  Search, 
  User, 
  Wrench, 
  Building2,
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  LogOut,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { role, profile, user, signOut } = useAuth();

  const navLinks = [
    { href: "/dashboard/devices", label: "Owner Registry", icon: Smartphone },
    { href: "/dashboard/fleet", label: "SME Fleet", icon: Building2 },
    { href: "/technician/scan", label: "Dealer & Tech Hub", icon: QrCode },
    { href: "/verify", label: "Public Search", icon: Search },
    { href: "/pricing", label: "Plans", icon: Sparkles },
  ];

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    router.push("/");
  };

  const isTechnician = role === "technician";
  const isFleetManager = role === "fleet_manager";
  const isAccredited = profile?.technician_profile?.accreditation_status === "VERIFIED";

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

        {/* Right Action: Authenticated Profile & Role Badge */}
        <div className="hidden md:flex items-center gap-2 relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-200 transition"
              >
                {isTechnician ? (
                  <>
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAccredited ? "Certified Dealer" : "Pending Guild"}</span>
                  </>
                ) : isFleetManager ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>SME Fleet Admin</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    <span>Gadget Owner</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-zinc-400 opacity-60 ml-0.5" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-3 border border-zinc-700/80 shadow-2xl space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-2 py-1.5 border-b border-zinc-800 space-y-0.5">
                    <div className="font-semibold text-white truncate">
                      {profile?.full_name || "Authenticated User"}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      {user.email}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/dashboard/devices"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                      <span>My Private Registry</span>
                    </Link>

                    {isFleetManager && (
                      <Link
                        href="/dashboard/fleet"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Corporate IT Fleet</span>
                      </Link>
                    )}

                    <Link
                      href="/technician/scan"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                    >
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dealer Scanner Console</span>
                    </Link>

                    <Link
                      href="/dashboard/billing"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Subscription & Billing</span>
                    </Link>
                  </div>

                  <div className="pt-1.5 border-t border-zinc-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
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
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-red-400 bg-zinc-900 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
