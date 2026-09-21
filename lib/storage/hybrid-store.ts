"use client";

import { Device, Profile, UserRole, FleetAsset, FleetAuditLog } from "@/lib/types/database";

const STORAGE_KEYS = {
  USER: "rupalshield_user",
  PROFILE: "rupalshield_profile",
  DEVICES: "rupalshield_devices",
  FLEET_ASSETS: "rupalshield_fleet_assets",
  FLEET_AUDIT_LOGS: "rupalshield_fleet_audit_logs",
  VERIFICATION_LOGS: "rupalshield_verification_logs",
};

// Seed consumer devices (100% valid Luhn IMEIs)
const DEFAULT_DEVICES: Device[] = [
  {
    id: "dev-seed-001",
    owner_id: "user-owner-001",
    brand: "Apple",
    model: "iPhone 15 Pro (Natural Titanium)",
    imei_primary: "358742091234562",
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
    imei_primary: "862345041234564",
    serial_number: "R5CW20XXXXX",
    status: "STOLEN",
    purchase_receipt_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Seed SME IT Fleet Assets
const DEFAULT_FLEET_ASSETS: FleetAsset[] = [
  {
    id: "fleet-001",
    owner_id: "org-fleet-001",
    asset_tag: "CORP-MAC-014",
    brand: "Apple",
    model: "MacBook Pro 16\" M3 Max",
    imei_primary: "991482093847562",
    serial_number: "C02G89XYMD6T",
    status: "CLEAN",
    assigned_to_name: "Sarah Chen",
    assigned_to_email: "s.chen@apex-enterprises.io",
    department: "Engineering / AI Core",
    assigned_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    lockdown_status: "ACTIVE",
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fleet-002",
    owner_id: "org-fleet-001",
    asset_tag: "CORP-TP-088",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 12",
    imei_primary: "998273641029384",
    serial_number: "PF4B9Z12",
    status: "CLEAN",
    assigned_to_name: "Marcus Vance",
    assigned_to_email: "m.vance@apex-enterprises.io",
    department: "Finance & Treasury",
    assigned_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    lockdown_status: "ACTIVE",
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fleet-003",
    owner_id: "org-fleet-001",
    asset_tag: "CORP-IPH-023",
    brand: "Apple",
    model: "iPhone 15 Enterprise (Black Titanium)",
    imei_primary: "359182736450194",
    serial_number: "DNPX87654KLM",
    status: "CLEAN",
    assigned_to_name: "Elena Rostova",
    assigned_to_email: "e.rostova@apex-enterprises.io",
    department: "Executive Logistics",
    assigned_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    lockdown_status: "ACTIVE",
    created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fleet-004",
    owner_id: "org-fleet-001",
    asset_tag: "CORP-DEL-102",
    brand: "Dell",
    model: "Latitude 7440 Ultralight",
    imei_primary: "993746192837465",
    serial_number: "8X99K24",
    status: "CLEAN",
    department: "IT Depot Reserve",
    lockdown_status: "ACTIVE",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const DEFAULT_FLEET_LOGS: FleetAuditLog[] = [
  {
    id: "log-001",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: "VERIFIED_CLEAN",
    asset_id: "fleet-001",
    asset_name: "MacBook Pro 16\" (CORP-MAC-014)",
    actor: "Automated Registry Ping",
    details: "Zero theft flags across nationwide repair hub network.",
  },
  {
    id: "log-002",
    timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
    action: "ASSIGNED",
    asset_id: "fleet-003",
    asset_name: "iPhone 15 Enterprise (CORP-IPH-023)",
    actor: "IT Ops Admin",
    details: "Assigned custody to Elena Rostova (Executive Logistics).",
  },
  {
    id: "log-003",
    timestamp: new Date(Date.now() - 86400000 * 90).toISOString(),
    action: "ASSIGNED",
    asset_id: "fleet-001",
    asset_name: "MacBook Pro 16\" (CORP-MAC-014)",
    actor: "IT Ops Admin",
    details: "Assigned custody to Sarah Chen (Engineering).",
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
    let fullName = "Alex Morgan (Deed Holder)";
    let email = "owner@rupalshield.io";
    let companyName: string | undefined;
    let shopName: string | undefined;

    if (role === "technician") {
      fullName = "David (Certified Lead Tech)";
      email = "technician@repairhub.io";
      shopName = "Apex Micro-Soldering Hub";
    } else if (role === "fleet_manager") {
      fullName = "Jordan Rivera (SME Fleet Administrator)";
      email = "fleet.admin@apex-enterprises.io";
      companyName = "Apex Global Technologies";
    }

    const demoUser = {
      id: role === "technician" ? "tech-demo-001" : role === "fleet_manager" ? "fleet-admin-001" : "user-owner-001",
      email,
      user_metadata: {
        full_name: fullName,
        role,
      },
    };

    const demoProfile: Profile = {
      id: demoUser.id,
      role,
      full_name: fullName,
      shop_name: shopName,
      company_name: companyName,
      market_location: role === "technician" ? "Computer Village Cluster 14" : undefined,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.setCurrentSession(demoUser, demoProfile);
    return { user: demoUser, profile: demoProfile };
  }

  // --- CONSUMER DEVICE METHODS ---
  getDevices(): Device[] {
    if (!this.isBrowser()) return DEFAULT_DEVICES;
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(DEFAULT_DEVICES));
      return DEFAULT_DEVICES;
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEVICES;
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

  mergeDevices(serverDevices: Device[]): Device[] {
    const localDevices = this.getDevices();
    const map = new Map<string, Device>();

    for (const dev of serverDevices) {
      if (dev && dev.id) map.set(dev.id, dev);
    }

    for (const dev of localDevices) {
      if (dev && dev.id) {
        if (!map.has(dev.id)) {
          map.set(dev.id, dev);
        }
      }
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(merged));
    }

    return merged;
  }

  // --- SME FLEET MANAGEMENT METHODS ---
  getFleetAssets(): FleetAsset[] {
    if (!this.isBrowser()) return DEFAULT_FLEET_ASSETS;
    const stored = localStorage.getItem(STORAGE_KEYS.FLEET_ASSETS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.FLEET_ASSETS, JSON.stringify(DEFAULT_FLEET_ASSETS));
      return DEFAULT_FLEET_ASSETS;
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FLEET_ASSETS;
    } catch {
      return DEFAULT_FLEET_ASSETS;
    }
  }

  assignFleetAsset(assetId: string, employeeName: string, employeeEmail: string, department: string): FleetAsset | null {
    const assets = this.getFleetAssets();
    let updatedAsset: FleetAsset | null = null;

    const updated = assets.map((a) => {
      if (a.id === assetId) {
        updatedAsset = {
          ...a,
          assigned_to_name: employeeName.trim(),
          assigned_to_email: employeeEmail.trim(),
          department: department.trim(),
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return updatedAsset;
      }
      return a;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FLEET_ASSETS, JSON.stringify(updated));
    }

    if (updatedAsset) {
      this.addFleetAuditLog({
        action: "ASSIGNED",
        asset_id: assetId,
        asset_name: `${(updatedAsset as FleetAsset).brand} ${(updatedAsset as FleetAsset).model} (${(updatedAsset as FleetAsset).asset_tag})`,
        actor: this.getCurrentProfile()?.full_name || "Fleet Administrator",
        details: `Assigned custody to ${employeeName} (${department}).`,
      });
    }

    return updatedAsset;
  }

  unassignFleetAsset(assetId: string): FleetAsset | null {
    const assets = this.getFleetAssets();
    let updatedAsset: FleetAsset | null = null;

    const updated = assets.map((a) => {
      if (a.id === assetId) {
        updatedAsset = {
          ...a,
          assigned_to_name: undefined,
          assigned_to_email: undefined,
          department: "IT Depot Reserve",
          assigned_at: undefined,
          updated_at: new Date().toISOString(),
        };
        return updatedAsset;
      }
      return a;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FLEET_ASSETS, JSON.stringify(updated));
    }

    if (updatedAsset) {
      this.addFleetAuditLog({
        action: "UNASSIGNED",
        asset_id: assetId,
        asset_name: `${(updatedAsset as FleetAsset).brand} ${(updatedAsset as FleetAsset).model} (${(updatedAsset as FleetAsset).asset_tag})`,
        actor: this.getCurrentProfile()?.full_name || "Fleet Administrator",
        details: "Returned to IT Depot Reserve.",
      });
    }

    return updatedAsset;
  }

  toggleFleetLockdown(assetId: string): { asset: FleetAsset | null; newStatus: "ACTIVE" | "LOCKED_DOWN" } {
    const assets = this.getFleetAssets();
    let updatedAsset: FleetAsset | null = null;
    let nextStatus: "ACTIVE" | "LOCKED_DOWN" = "LOCKED_DOWN";

    const updated = assets.map((a) => {
      if (a.id === assetId) {
        const isLocked = a.lockdown_status === "LOCKED_DOWN";
        nextStatus = isLocked ? "ACTIVE" : "LOCKED_DOWN";
        updatedAsset = {
          ...a,
          lockdown_status: nextStatus,
          status: nextStatus === "LOCKED_DOWN" ? "STOLEN" : "CLEAN",
          updated_at: new Date().toISOString(),
        };
        return updatedAsset;
      }
      return a;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FLEET_ASSETS, JSON.stringify(updated));
    }

    if (updatedAsset) {
      this.addFleetAuditLog({
        action: nextStatus === "LOCKED_DOWN" ? "LOCKDOWN_TRIGGERED" : "LOCKDOWN_RELEASED",
        asset_id: assetId,
        asset_name: `${(updatedAsset as FleetAsset).brand} ${(updatedAsset as FleetAsset).model} (${(updatedAsset as FleetAsset).asset_tag})`,
        actor: this.getCurrentProfile()?.full_name || "Fleet Administrator",
        details:
          nextStatus === "LOCKED_DOWN"
            ? "EMERGENCY LOCKDOWN: Asset flagged as compromised and pushed to national repair blacklist."
            : "Lockdown lifted: Hardware restored to verified clean status.",
      });
    }

    return { asset: updatedAsset, newStatus: nextStatus };
  }

  getFleetAuditLogs(): FleetAuditLog[] {
    if (!this.isBrowser()) return DEFAULT_FLEET_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.FLEET_AUDIT_LOGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.FLEET_AUDIT_LOGS, JSON.stringify(DEFAULT_FLEET_LOGS));
      return DEFAULT_FLEET_LOGS;
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FLEET_LOGS;
    } catch {
      return DEFAULT_FLEET_LOGS;
    }
  }

  addFleetAuditLog(entry: Omit<FleetAuditLog, "id" | "timestamp">): FleetAuditLog {
    const logs = this.getFleetAuditLogs();
    const newLog: FleetAuditLog = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newLog, ...logs];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FLEET_AUDIT_LOGS, JSON.stringify(updated.slice(0, 50)));
    }
    return newLog;
  }

  // --- SCANNER IDENTIFIER LOOKUP (CROSS-REFERENCING CONSUMER + FLEET) ---
  lookupDeviceByIdentifier(identifier: string): { status: "VERIFIED_CLEAN" | "UNREGISTERED" | "FLAGGED_STOLEN"; device?: Device } {
    const cleaned = identifier.replace(/[^0-9A-Za-z]/g, "");

    // 1. Check SME Fleet Assets first
    const fleetAssets = this.getFleetAssets();
    const matchedFleet = fleetAssets.find(
      (a) =>
        a.imei_primary.replace(/[^0-9A-Za-z]/g, "") === cleaned ||
        (a.imei_secondary && a.imei_secondary.replace(/[^0-9A-Za-z]/g, "") === cleaned) ||
        (a.serial_number && a.serial_number.replace(/[^0-9A-Za-z]/g, "") === cleaned) ||
        a.asset_tag.replace(/[^0-9A-Za-z]/g, "") === cleaned
    );

    if (matchedFleet) {
      if (matchedFleet.lockdown_status === "LOCKED_DOWN" || matchedFleet.status === "STOLEN") {
        return { status: "FLAGGED_STOLEN", device: matchedFleet };
      }
      return { status: "VERIFIED_CLEAN", device: matchedFleet };
    }

    // 2. Check Consumer Deeds
    const devices = this.getDevices();
    const matched = devices.find(
      (d) =>
        d.imei_primary.replace(/[^0-9A-Za-z]/g, "") === cleaned ||
        (d.imei_secondary && d.imei_secondary.replace(/[^0-9A-Za-z]/g, "") === cleaned) ||
        (d.serial_number && d.serial_number.replace(/[^0-9A-Za-z]/g, "") === cleaned)
    );

    if (!matched) {
      // Fallback checks for demo testing
      if (cleaned === "862345041234564" || cleaned === "862345041234568") {
        return {
          status: "FLAGGED_STOLEN",
          device: {
            id: "dev-mock-stolen",
            owner_id: "owner-001",
            brand: "Samsung",
            model: "Galaxy S24 Ultra",
            imei_primary: "862345041234564",
            status: "STOLEN",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
      if (cleaned === "358742091234562" || cleaned === "358742091234567") {
        return {
          status: "VERIFIED_CLEAN",
          device: {
            id: "dev-mock-clean",
            owner_id: "owner-001",
            brand: "Apple",
            model: "iPhone 15 Pro",
            imei_primary: "358742091234562",
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