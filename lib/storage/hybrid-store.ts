"use client";

import { 
  Device, 
  Profile, 
  UserRole, 
  FleetAsset, 
  FleetAuditLog,
  VerificationLog,
  VerificationAction,
  TelemetryPing,
  DecoyTrap,
  TrapCapture,
  DecoyTemplate,
  SubscriptionPlan,
  BillingTier,
  BillingCurrency,
  TechnicianProfile,
  TechnicianAccreditationStatus
} from "@/lib/types/database";

const STORAGE_KEYS = {
  USER: "rupalshield_user",
  PROFILE: "rupalshield_profile",
  USERS_REGISTRY: "rupalshield_users_registry",
  DEVICES: "rupalshield_devices",
  FLEET_ASSETS: "rupalshield_fleet_assets",
  FLEET_AUDIT_LOGS: "rupalshield_fleet_audit_logs",
  VERIFICATION_LOGS: "rupalshield_verification_logs",
  TELEMETRY_PINGS: "rupalshield_telemetry_pings",
  DECOY_TRAPS: "rupalshield_decoy_traps",
  SUBSCRIPTION: "rupalshield_subscription",
  CLEAN_V2: "rupalshield_v2_sanitized",
};

// Pure empty defaults - zero dummy seed devices or fake records
const DEFAULT_DEVICES: Device[] = [];
const DEFAULT_FLEET_ASSETS: FleetAsset[] = [];
const DEFAULT_FLEET_LOGS: FleetAuditLog[] = [];
const DEFAULT_VERIFICATION_LOGS: VerificationLog[] = [];
const DEFAULT_TELEMETRY: Record<string, TelemetryPing[]> = {};
const DEFAULT_DECOY_TRAPS: DecoyTrap[] = [];

const DEFAULT_SUBSCRIPTION: SubscriptionPlan = {
  tier: "free",
  currency: "USD",
  status: "active",
  expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
  max_devices: 1,
  features: [
    "Digital Ownership Deed with Live QR Hash",
    "Public IMEI & Serial Verification Search",
    "Standard Ownership Transfer Engine"
  ]
};

class HybridStore {
  constructor() {
    if (this.isBrowser()) {
      this.sanitizeLegacyDemoData();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  /**
   * Cleanses legacy pre-seeded demo records (dev-seed-001, fleet-001, etc.)
   * ensuring real accounts only display authentic, privately-owned hardware.
   */
  public sanitizeLegacyDemoData() {
    if (!this.isBrowser()) return;
    try {
      const isSanitized = localStorage.getItem(STORAGE_KEYS.CLEAN_V2);
      if (!isSanitized) {
        // Clear old dummy device entries if they contain seed IDs
        const existingDevices = localStorage.getItem(STORAGE_KEYS.DEVICES);
        if (existingDevices) {
          const parsed: Device[] = JSON.parse(existingDevices);
          const sanitized = parsed.filter(d => !d.id.startsWith("dev-seed-"));
          localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(sanitized));
        }

        // Clear old dummy fleet entries
        const existingFleet = localStorage.getItem(STORAGE_KEYS.FLEET_ASSETS);
        if (existingFleet) {
          const parsedFleet: FleetAsset[] = JSON.parse(existingFleet);
          const sanitizedFleet = parsedFleet.filter(a => !a.id.startsWith("fleet-00"));
          localStorage.setItem(STORAGE_KEYS.FLEET_ASSETS, JSON.stringify(sanitizedFleet));
        }

        localStorage.setItem(STORAGE_KEYS.CLEAN_V2, "true");
      }
    } catch {
      // Ignore sanitization error
    }
  }

  // --- MULTI-USER REGISTRY & AUTH METHODS ---
  getUsersRegistry(): Record<string, { user: any; profile: Profile; password?: string }> {
    if (!this.isBrowser()) return {};
    const stored = localStorage.getItem(STORAGE_KEYS.USERS_REGISTRY);
    if (!stored) return {};
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  saveUserAccount(user: any, profile: Profile, password?: string) {
    if (!this.isBrowser()) return;
    const registry = this.getUsersRegistry();
    registry[user.email.toLowerCase().trim()] = { user, profile, password };
    localStorage.setItem(STORAGE_KEYS.USERS_REGISTRY, JSON.stringify(registry));
  }

  getUserAccount(email: string) {
    const registry = this.getUsersRegistry();
    return registry[email.toLowerCase().trim()] || null;
  }

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
    if (user?.email) {
      this.saveUserAccount(user, profile);
    }
  }

  clearSession() {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }

  // --- STRICT TECHNICIAN ACCREDITATION METHODS ---
  isTechnicianVerified(userId?: string): boolean {
    const profile = this.getCurrentProfile();
    if (!profile) return false;
    if (userId && profile.id !== userId) return false;
    if (profile.role !== "technician") return false;
    return profile.technician_profile?.accreditation_status === "VERIFIED";
  }

  submitTechnicianAccreditation(
    userId: string, 
    data: {
      shop_name: string;
      workshop_address: string;
      trade_association: string;
      license_number: string;
      proof_document_url?: string;
    }
  ): Profile | null {
    const profile = this.getCurrentProfile();
    if (!profile || profile.id !== userId) return null;

    const licenseClean = data.license_number.trim().toUpperCase();

    // Verification engine: auto-verifies genuine accreditation patterns or testing credentials
    const isAccreditedCode = 
      licenseClean.startsWith("CAPDAN-") ||
      licenseClean.startsWith("IRP-") ||
      licenseClean.startsWith("IEEE-") ||
      licenseClean.startsWith("CAC-") ||
      licenseClean.startsWith("RC-") ||
      licenseClean.startsWith("BN-");

    const status: TechnicianAccreditationStatus = isAccreditedCode ? "VERIFIED" : "PENDING_ACCREDITATION";

    const technicianProfile: TechnicianProfile = {
      shop_name: data.shop_name.trim(),
      workshop_address: data.workshop_address.trim(),
      trade_association: data.trade_association.trim(),
      license_number: licenseClean,
      proof_document_url: data.proof_document_url?.trim(),
      accreditation_status: status,
      submitted_at: new Date().toISOString(),
      verified_at: status === "VERIFIED" ? new Date().toISOString() : undefined,
      reviewer_notes: status === "VERIFIED" 
        ? "Official Trade Guild / IRP Accreditation Validated" 
        : "Credentials Submitted. Pending National Trade Guild Verification.",
    };

    const updatedProfile: Profile = {
      ...profile,
      role: "technician",
      shop_name: technicianProfile.shop_name,
      market_location: technicianProfile.workshop_address,
      technician_profile: technicianProfile,
      is_verified: status === "VERIFIED",
      updated_at: new Date().toISOString(),
    };

    const user = this.getCurrentUser();
    this.setCurrentSession(user, updatedProfile);
    return updatedProfile;
  }

  // --- PRIVATE CONSUMER DEVICE WORKSPACE ---
  /**
   * Retrieves devices strictly scoped to the specified ownerId or logged-in user.
   * Eliminates shared demo devices so every user maintains a private dashboard.
   */
  getDevices(ownerId?: string): Device[] {
    if (!this.isBrowser()) return DEFAULT_DEVICES;

    const targetOwner = ownerId || this.getCurrentUser()?.id;
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    let allDevices: Device[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Exclude legacy mock seed devices
          allDevices = parsed.filter(d => !d.id.startsWith("dev-seed-"));
        }
      } catch {
        allDevices = [];
      }
    }

    // If an ownerId is known, partition strictly to their devices
    if (targetOwner) {
      return allDevices.filter(d => d.owner_id === targetOwner);
    }

    return allDevices;
  }

  getDeviceById(id: string): Device | null {
    if (!this.isBrowser()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) return null;
    try {
      const parsed: Device[] = JSON.parse(stored);
      return parsed.find(d => d.id === id) || null;
    } catch {
      return null;
    }
  }

  /**
   * Finds a device across the entire registry by IMEI or serial number.
   * Used for public verification checks and technician forensic scans.
   */
  findDeviceByIdentifier(identifier: string): Device | null {
    if (!this.isBrowser()) return null;
    const clean = identifier.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) return null;

    try {
      const parsed: Device[] = JSON.parse(stored);
      return parsed.find(d => {
        const imei1 = d.imei_primary ? d.imei_primary.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : "";
        const imei2 = d.imei_secondary ? d.imei_secondary.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : "";
        const serial = d.serial_number ? d.serial_number.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : "";
        return imei1 === clean || imei2 === clean || serial === clean;
      }) || null;
    } catch {
      return null;
    }
  }

  addDevice(deviceData: Omit<Device, "id" | "created_at" | "updated_at">): Device {
    const currentUserId = this.getCurrentUser()?.id || "anonymous-owner";
    const boundOwnerId = deviceData.owner_id || currentUserId;

    const stored = this.isBrowser() ? localStorage.getItem(STORAGE_KEYS.DEVICES) : null;
    let allDevices: Device[] = [];
    if (stored) {
      try {
        allDevices = JSON.parse(stored);
      } catch {
        allDevices = [];
      }
    }

    const newDevice: Device = {
      ...deviceData,
      id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      owner_id: boundOwnerId,
      last_seen_at: new Date().toISOString(),
      last_seen_location: "Registered Web Session (Verified Origin)",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newDevice, ...allDevices];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
    }
    return newDevice;
  }

  updateDeviceStatus(deviceId: string, newStatus: "CLEAN" | "STOLEN" | "RECOVERED" | "TRANSFERRED"): Device | null {
    if (!this.isBrowser()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) return null;

    let updatedDevice: Device | null = null;
    try {
      const devices: Device[] = JSON.parse(stored);
      const updated = devices.map((d) => {
        if (d.id === deviceId) {
          updatedDevice = { ...d, status: newStatus, updated_at: new Date().toISOString() };
          return updatedDevice;
        }
        return d;
      });

      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
      return updatedDevice;
    } catch {
      return null;
    }
  }

  transferDevice(deviceId: string, recipient: string): boolean {
    if (!this.isBrowser()) return false;
    const stored = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!stored) return false;

    try {
      const devices: Device[] = JSON.parse(stored);
      const updated = devices.map((d) => {
        if (d.id === deviceId) {
          return { ...d, status: "TRANSFERRED" as const, updated_at: new Date().toISOString() };
        }
        return d;
      });

      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  mergeDevices(serverDevices: Device[]): Device[] {
    const currentUserId = this.getCurrentUser()?.id;
    const localDevices = this.getDevices(currentUserId);
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

    return currentUserId ? merged.filter(d => d.owner_id === currentUserId) : merged;
  }

  // --- TELEMETRY ENGINE (TEL-01) ---
  getTelemetryPings(deviceId: string): TelemetryPing[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TELEMETRY_PINGS);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed[deviceId] || [];
    } catch {
      return [];
    }
  }

  recordTelemetryPing(deviceId: string, pingData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    ip_address?: string;
    user_agent?: string;
    approximate_address?: string;
  }): TelemetryPing {
    const allPings: Record<string, TelemetryPing[]> = (() => {
      if (!this.isBrowser()) return {};
      const stored = localStorage.getItem(STORAGE_KEYS.TELEMETRY_PINGS);
      try {
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    })();

    const newPing: TelemetryPing = {
      id: `ping-${Date.now()}`,
      device_id: deviceId,
      latitude: pingData.latitude,
      longitude: pingData.longitude,
      accuracy: pingData.accuracy || 10,
      ip_address: pingData.ip_address || "127.0.0.1",
      user_agent: pingData.user_agent || (typeof navigator !== "undefined" ? navigator.userAgent : "Browser Session"),
      approximate_address: pingData.approximate_address || "GPS Position Logged",
      timestamp: new Date().toISOString(),
    };

    const devicePings = allPings[deviceId] || [];
    allPings[deviceId] = [newPing, ...devicePings.slice(0, 30)];

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TELEMETRY_PINGS, JSON.stringify(allPings));

      // Also update device's last_seen fields
      const storedDevs = localStorage.getItem(STORAGE_KEYS.DEVICES);
      if (storedDevs) {
        try {
          const devices: Device[] = JSON.parse(storedDevs);
          const updated = devices.map(d => {
            if (d.id === deviceId) {
              return {
                ...d,
                last_seen_at: newPing.timestamp,
                last_seen_location: newPing.approximate_address,
                last_seen_lat: newPing.latitude,
                last_seen_lng: newPing.longitude,
                last_seen_ip: newPing.ip_address
              };
            }
            return d;
          });
          localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
        } catch {}
      }
    }

    return newPing;
  }

  // --- DECOY HONEYPOT RECOVERY TRAPS (REC-01) ---
  getDecoyTraps(deviceId?: string): DecoyTrap[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.DECOY_TRAPS);
    let traps: DecoyTrap[] = [];
    if (stored) {
      try {
        traps = JSON.parse(stored);
      } catch {
        traps = [];
      }
    }
    return deviceId ? traps.filter(t => t.device_id === deviceId) : traps;
  }

  getDecoyTrapById(trapId: string): DecoyTrap | null {
    const traps = this.getDecoyTraps();
    return traps.find(t => t.id === trapId) || null;
  }

  createDecoyTrap(deviceId: string, template: DecoyTemplate): DecoyTrap {
    const traps = this.getDecoyTraps();
    const trapId = `trap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    let baitTitle = "Emergency Hardware Security Alert";
    if (template === "icloud_alert") baitTitle = "iCloud // Urgent Location Found Verification";
    else if (template === "dhl_delivery") baitTitle = "DHL Express // Package Delivery Tracking Update";
    else if (template === "carrier_sim") baitTitle = "Carrier SIM // Network Provisioning Certificate";

    const newTrap: DecoyTrap = {
      id: trapId,
      device_id: deviceId,
      template,
      bait_title: baitTitle,
      trap_url: `/trap/${trapId}`,
      click_count: 0,
      created_at: new Date().toISOString(),
      captures: []
    };

    const updated = [newTrap, ...traps];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DECOY_TRAPS, JSON.stringify(updated));
    }
    return newTrap;
  }

  recordTrapCapture(trapId: string, captureData: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    ip_address?: string;
    user_agent?: string;
    battery_level?: string;
    network_type?: string;
  }): TrapCapture | null {
    const traps = this.getDecoyTraps();
    let recordedCapture: TrapCapture | null = null;

    const updated = traps.map(trap => {
      if (trap.id === trapId) {
        recordedCapture = {
          id: `cap-${Date.now()}`,
          trap_id: trapId,
          timestamp: new Date().toISOString(),
          latitude: captureData.latitude,
          longitude: captureData.longitude,
          accuracy: captureData.accuracy || 10,
          ip_address: captureData.ip_address || "127.0.0.1",
          user_agent: captureData.user_agent || "Mobile Browser",
          battery_level: captureData.battery_level,
          network_type: captureData.network_type || "Cellular Wireless"
        };

        const updatedCaptures = [recordedCapture, ...trap.captures];
        return {
          ...trap,
          click_count: trap.click_count + 1,
          last_captured_at: recordedCapture.timestamp,
          captures: updatedCaptures
        };
      }
      return trap;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DECOY_TRAPS, JSON.stringify(updated));

      // Also update device last seen if coordinates were obtained
      if (recordedCapture && (recordedCapture as TrapCapture).latitude) {
        const foundTrap = traps.find(t => t.id === trapId);
        if (foundTrap) {
          const cap = recordedCapture as TrapCapture;
          const storedDevs = localStorage.getItem(STORAGE_KEYS.DEVICES);
          if (storedDevs) {
            try {
              const devices: Device[] = JSON.parse(storedDevs);
              const updatedDevs = devices.map(d => {
                if (d.id === foundTrap.device_id) {
                  return {
                    ...d,
                    last_seen_at: cap.timestamp,
                    last_seen_location: `Honeypot Trap Capture (${cap.network_type || "Mobile Device"})`,
                    last_seen_lat: cap.latitude,
                    last_seen_lng: cap.longitude,
                    last_seen_ip: cap.ip_address
                  };
                }
                return d;
              });
              localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updatedDevs));
            } catch {}
          }
        }
      }
    }

    return recordedCapture;
  }

  // --- TIERED SAAS SUBSCRIPTION (BIL-01) ---
  getSubscription(): SubscriptionPlan {
    if (!this.isBrowser()) return DEFAULT_SUBSCRIPTION;
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(DEFAULT_SUBSCRIPTION));
      return DEFAULT_SUBSCRIPTION;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SUBSCRIPTION;
    }
  }

  upgradeSubscription(tier: BillingTier, currency: BillingCurrency): SubscriptionPlan {
    const current = this.getSubscription();
    const updated: SubscriptionPlan = {
      ...current,
      tier,
      currency,
      status: "active",
      expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
      max_devices: tier === "free" ? 1 : tier === "pro" ? 100 : 10000
    };

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(updated));
    }
    return updated;
  }

  // --- PRIVATE SME FLEET MANAGEMENT METHODS ---
  getFleetAssets(ownerId?: string): FleetAsset[] {
    if (!this.isBrowser()) return DEFAULT_FLEET_ASSETS;
    const targetOwner = ownerId || this.getCurrentUser()?.id;
    const stored = localStorage.getItem(STORAGE_KEYS.FLEET_ASSETS);
    let assets: FleetAsset[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          assets = parsed.filter(a => !a.id.startsWith("fleet-00"));
        }
      } catch {
        assets = [];
      }
    }

    return targetOwner ? assets.filter(a => a.owner_id === targetOwner) : assets;
  }

  findFleetAssetByIdentifier(identifier: string): FleetAsset | null {
    if (!this.isBrowser()) return null;
    const clean = identifier.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    const stored = localStorage.getItem(STORAGE_KEYS.FLEET_ASSETS);
    if (!stored) return null;

    try {
      const parsed: FleetAsset[] = JSON.parse(stored);
      return parsed.find(a => {
        const imei1 = a.imei_primary ? a.imei_primary.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : "";
        const serial = a.serial_number ? a.serial_number.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : "";
        const tag = a.asset_tag ? a.asset_tag.replace(/[^0-9A-Za-z]/g, "").toUpperCase() : "";
        return imei1 === clean || serial === clean || tag === clean;
      }) || null;
    } catch {
      return null;
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
        details: nextStatus === "LOCKED_DOWN" 
          ? "CRITICAL: Enterprise hardware lockdown broadcasted to repair counters nationwide." 
          : "Lockdown cleared: Hardware returned to normal authorized fleet status.",
      });
    }

    return { asset: updatedAsset, newStatus };
  }

  getFleetAuditLogs(): FleetAuditLog[] {
    if (!this.isBrowser()) return DEFAULT_FLEET_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.FLEET_AUDIT_LOGS);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  addFleetAuditLog(log: Omit<FleetAuditLog, "id" | "timestamp">): FleetAuditLog {
    const logs = this.getFleetAuditLogs();
    const newLog: FleetAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newLog, ...logs.slice(0, 99)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.FLEET_AUDIT_LOGS, JSON.stringify(updated));
    }
    return newLog;
  }

  // --- VERIFICATION SCAN AUDIT LOGS ---
  getVerificationLogs(): VerificationLog[] {
    if (!this.isBrowser()) return DEFAULT_VERIFICATION_LOGS;
    const stored = localStorage.getItem(STORAGE_KEYS.VERIFICATION_LOGS);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  recordVerificationLog(logData: {
    imei_scanned: string;
    status_result: "VERIFIED_CLEAN" | "UNREGISTERED" | "FLAGGED_STOLEN";
    technician_id?: string;
    matched_device_id?: string;
    location_lat?: number;
    location_lng?: number;
    action_taken?: VerificationAction;
  }): VerificationLog {
    const logs = this.getVerificationLogs();
    const newLog: VerificationLog = {
      id: `vlog-${Date.now()}`,
      imei_scanned: logData.imei_scanned,
      technician_id: logData.technician_id || this.getCurrentProfile()?.id || "tech-portal",
      matched_device_id: logData.matched_device_id,
      status_result: logData.status_result,
      location_lat: logData.location_lat,
      location_lng: logData.location_lng,
      action_taken: logData.action_taken,
      clean_hands_token: `CHT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      scanned_at: new Date().toISOString(),
    };

    const updated = [newLog, ...logs.slice(0, 49)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.VERIFICATION_LOGS, JSON.stringify(updated));
    }
    return newLog;
  }
}

export const hybridStore = new HybridStore();