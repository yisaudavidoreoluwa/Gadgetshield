export type UserRole = 'owner' | 'technician' | 'admin';
export type DeviceStatus = 'CLEAN' | 'STOLEN' | 'RECOVERED' | 'TRANSFERRED';
export type VerificationAction = 'INTAKE_HOLD' | 'SERVICE_DECLINED' | 'CLEAN_INTAKE';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number?: string;
  shop_name?: string;
  market_location?: string;
  is_verified: boolean;
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
  created_at: string;
  updated_at: string;
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
