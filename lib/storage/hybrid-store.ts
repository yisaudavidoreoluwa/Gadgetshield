"use client";

import { Device, Profile, UserRole } from "@/lib/types/database";

const STORAGE_KEYS = {
  USER: "rupalshield_user",
  PROFILE: "rupalshield_profile",
  DEVICES: "rupalshield_devices",
  VERIFICATION_LOGS: "rupalshield_verification_logs",
};

// Seed devices if local storage is empty
const DEFAULT_DEVICES: Device[] = [
  {
    id: "dev-seed-001",
    owner_id: "user-owner-001",
    brand: "Apple",
    model: "iPhone 15 Pro (Natural Titanium)",
    imei_primary: "358742091234567",
    serial_number: "F2LLN0G9XXXX",
    status: "CLEAN",
    purchase_receipt_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "dev-seed-002",
    owner_id: "user-owner-001",
    brand: "Samsung",
    model: "Galaxy S24 Ultra (Titanium Gray)",
    imei_primary: "862345041234568",
    serial_number: "R5CW20XXXXX",
    status: "STOLEN",
    purchase_receipt_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

class HybridStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  // --- AUTH METHODS ---
  getCurrentUser(): any | null {
    if (!this.isBrowser()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  getCurrentProfile(): Profile | null {
    if (!this.isBrowser()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  setCurrentSession(user: any, profile: Profile) {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  clearSession() {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }

  loginDemoUser(role: UserRole = "owner"): { user: any; profile: Profile } {
    const isTech = role === "technician";
    const demoUser = {
      id: isTech ? "tech-demo-001" : "user-owner-001",
      email: isTech ? "technician@repairhub.io" : "owner@rupalshield.io",
      user_metadata: {
        full_name: isTech ? "David (Certified Lead Tech)" : "Alex Morgan (Deed Holder)",
        role,
      },
    };

    const demoProfile: Profile = {
      id: demoUser.id,
      role,
      full_name: demoUser.user_metadata.full_name,
      shop_name: isTech ? "Apex Micro-Soldering Hub" : undefined,
      market_location: isTech ? "Computer Village Cluster 14" : undefined,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.setCurrentSession(demoUser, demoProfile);
    return { user: demoUser, profile: demoProfile };
  }

  // --- DEVICE METHODS ---
  getDevices(): Device[] {
    if (!this.isBrowser()) return DEFAULT_DEVICES;
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) {
      // Initialize with seed devices so the app has test data right away
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
      return DEFAULT_DEVICES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_DEVICES;
    }
  }

  addDevice(deviceData: Omit<Device, "id" | "created_at" | "updated_at">): Device {
    const devices = this.getDevices();
    const newDevice: Device = {
      ...deviceData,
      id: `dev-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newDevice, ...devices];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
    }
    return newDevice;
  }

  updateDeviceStatus(deviceId: string, newStatus: "CLEAN" | "STOLEN" | "RECOVERED" | "TRANSFERRED"): Device | null {
    const devices = this.getDevices();
    let updatedDevice: Device | null = null;

    const updated = devices.map((d) => {
      if (d.id === deviceId) {
        updatedDevice = { ...d, status: newStatus, updated_at: new Date().toISOString() };
        return updatedDevice;
      }
      return d;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
    }
    return updatedDevice;
  }

  transferDevice(deviceId: string, recipient: string): boolean {
    const devices = this.getDevices();
    const updated = devices.map((d) => {
      if (d.id === deviceId) {
        return { ...d, status: "TRANSFERRED" as const, updated_at: new Date().toISOString() };
      }
      return d;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
    }
    return true;
  }

  // --- SCANNER IDENTIFIER LOOKUP ---
  lookupDeviceByIdentifier(identifier: string): { status: "VERIFIED_CLEAN" | "UNREGISTERED" | "FLAGGED_STOLEN"; device?: Device } {
    const cleaned = identifier.replace(/[^0-9A-Za-z]/g, "");
    const devices = this.getDevices();

    // Check exact match on primary IMEI, secondary IMEI, or Serial
    const matched = devices.find(
      (d) =>
        d.imei_primary.replace(/[^0-9A-Za-z]/g, "") === cleaned ||
        (d.imei_secondary && d.imei_secondary.replace(/[^0-9A-Za-z]/g, "") === cleaned) ||
        (d.serial_number && d.serial_number.replace(/[^0-9A-Za-z]/g, "") === cleaned)
    );

    if (!matched) {
      // Hardcoded fallback checks for demo
      if (cleaned === "862345041234568") {
        return {
          status: "FLAGGED_STOLEN",
          device: {
            id: "dev-mock-stolen",
            owner_id: "owner-001",
            brand: "Samsung",
            model: "Galaxy S24 Ultra",
            imei_primary: "862345041234568",
            status: "STOLEN",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
      if (cleaned === "358742091234567") {
        return {
          status: "VERIFIED_CLEAN",
          device: {
            id: "dev-mock-clean",
            owner_id: "owner-001",
            brand: "Apple",
            model: "iPhone 15 Pro",
            imei_primary: "358742091234567",
            status: "CLEAN",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
      return { status: "UNREGISTERED" };
    }

    if (matched.status === "STOLEN") {
      return { status: "FLAGGED_STOLEN", device: matched };
    }

    return { status: "VERIFIED_CLEAN", device: matched };
  }
}

export const hybridStore = new HybridStore();