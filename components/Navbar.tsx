"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, QrCode, Smartphone, CheckCircle, Menu, X, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/technician/scan", label: "Technician Portal", icon: QrCode },
    { href: "/dashboard/devices", label: "Owner Registry", icon: Smartphone },
    { href: "/verify", label: "Public Search", icon: CheckCircle },
  ];

  return (
    <header className="border-b border-neutral-800 bg-black/90 backdrop-blur sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-mono font-bold text-sm tracking-tighter group-hover:bg-neutral-200 transition">
            <Shield className="w-4 h-4 fill-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold tracking-widest uppercase text-white">
              RUPALSHIELD
            </span>
            <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase">
              DEFENSE REGISTRY
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition ${
                  isActive
                    ? "bg-neutral-900 text-white border border-neutral-700"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-950"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="font-mono text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded border border-neutral-800 hover:border-neutral-700 transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Login / Hub</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-neutral-400 hover:text-white"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-3 space-y-2 font-mono text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded ${
                  isActive ? "bg-white text-black font-semibold" : "text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded border border-neutral-800 text-neutral-300 hover:bg-neutral-900"
          >
            <User className="w-4 h-4" />
            <span>Login / Hub</span>
          </Link>
        </div>
      )}
    </header>
  );
}
