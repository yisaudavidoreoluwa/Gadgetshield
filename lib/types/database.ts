export type UserRole = 'owner' | 'technician' | 'fleet_manager' | 'admin';
export type DeviceStatus = 'CLEAN' | 'STOLEN' | 'RECOVERED' | 'TRANSFERRED';
export type VerificationAction = 'INTAKE_HOLD' | 'SERVICE_DECLINED' | 'CLEAN_INTAKE';
export type TechnicianAccreditationStatus = 'UNACCREDITED' | 'PENDING_ACCREDITATION' | 'VERIFIED' | 'REJECTED';

export interface TechnicianProfile {
  shop_name: string;
  workshop_address: string;
  trade_association: string;
  license_number: string;
  proof_document_url?: string;
  accreditation_status: TechnicianAccreditationStatus;
  submitted_at: string;
  verified_at?: string;
  reviewer_notes?: string;
}

export interface FleetProfile {
  company_name: string;
  rc_number: string;
  corporate_domain?: string;
  registered_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone_number?: string;
  shop_name?: string;
  market_location?: string;
  company_name?: string;
  is_verified: boolean;
  technician_profile?: TechnicianProfile;
  fleet_profile?: FleetProfile;
  subscription_tier?: BillingTier;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  owner_id: string;
  brand: string;
  model: string;
  imei_primary: string;
  imei_secondary?: string;
  serial_number?: string;
  status: DeviceStatus;
  purchase_receipt_url?: string;
  last_seen_at?: string;
  last_seen_location?: string;
  last_seen_lat?: number;
  last_seen_lng?: number;
  last_seen_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface FleetAsset extends Device {
  asset_tag: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  department?: string;
  assigned_at?: string;
  lockdown_status?: 'ACTIVE' | 'LOCKED_DOWN';
}

export interface FleetAuditLog {
  id: string;
  timestamp: string;
  action: 'ASSIGNED' | 'UNASSIGNED' | 'LOCKDOWN_TRIGGERED' | 'LOCKDOWN_RELEASED' | 'VERIFIED_CLEAN' | 'ASSET_CREATED';
  asset_id: string;
  asset_name: string;
  actor: string;
  details: string;
}

export type ConsentType = 'LOCATION_TRACKING' | 'TELEMETRY_HEARTBEAT' | 'RECOVERY_VERIFICATION' | 'AUDIT_LOGGING';
export type ConsentStatus = 'GRANTED' | 'REVOKED' | 'DENIED';

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  status: ConsentStatus;
  purpose: string;
  ip_address?: string;
  user_agent?: string;
  granted_at: string;
  revoked_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface TelemetryPing {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  ip_address: string;
  user_agent: string;
  approximate_address?: string;
  timestamp: string;
}

export type DecoyTemplate = 'lawful_recovery' | 'custody_verify' | 'icloud_alert' | 'carrier_sim' | 'dhl_delivery';

export interface TrapCapture {
  id: string;
  trap_id: string;
  timestamp: string;
  consent_acknowledged: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  ip_address: string;
  user_agent: string;
  battery_level?: string;
  network_type?: string;
  holder_circumstance?: string;
  handover_preference?: string;
  dropoff_location_note?: string;
  contact_info?: string;
  message_to_owner?: string;
  receipt_token?: string;
}

export interface DecoyTrap {
  id: string;
  device_id: string;
  template: DecoyTemplate;
  bait_title: string;
  trap_url: string;
  click_count: number;
  created_at: string;
  last_captured_at?: string;
  captures: TrapCapture[];
}

export type BillingTier = 'free' | 'pro' | 'fleet';
export type BillingCurrency = 'USD' | 'NGN';

export interface SubscriptionPlan {
  tier: BillingTier;
  currency: BillingCurrency;
  status: 'active' | 'trialing' | 'canceled';
  expires_at: string;
  max_devices: number;
  features: string[];
}

export interface TheftReport {
  id: string;
  device_id: string;
  reported_at: string;
  incident_description?: string;
  contact_email_phone: string;
  bounty_amount: number;
}

export interface VerificationLog {
  id: string;
  imei_scanned: string;
  technician_id: string;
  matched_device_id?: string;
  status_result: 'VERIFIED_CLEAN' | 'UNREGISTERED' | 'FLAGGED_STOLEN';
  location_lat?: number;
  location_lng?: number;
  ip_address?: string;
  action_taken?: VerificationAction;
  clean_hands_token: string;
  scanned_at: string;
}
