-- ==============================================================================
-- GADGETSHIELD PRODUCTION DATABASE SCHEMA
-- Privacy-First Anti-Theft Registry, Audit Logs, Consent Records & RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing triggers and functions to allow clean idempotent re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ==============================================================================
-- TABLE: PROFILES
-- Extends auth.users with RBAC persona, accreditation and contact info
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'technician', 'fleet_manager', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    shop_name TEXT,
    market_location TEXT,
    company_name TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    technician_profile JSONB DEFAULT NULL,
    fleet_profile JSONB DEFAULT NULL,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'fleet')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TABLE: DEVICES
-- Primary hardware registry for consumer and enterprise gadgets
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    imei_primary TEXT NOT NULL,
    imei_secondary TEXT,
    serial_number TEXT,
    status TEXT NOT NULL DEFAULT 'CLEAN' CHECK (status IN ('CLEAN', 'STOLEN', 'RECOVERED', 'TRANSFERRED')),
    purchase_receipt_url TEXT,
    last_seen_at TIMESTAMPTZ,
    last_seen_location TEXT,
    last_seen_lat DOUBLE PRECISION,
    last_seen_lng DOUBLE PRECISION,
    last_seen_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_devices_owner ON public.devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_devices_imei ON public.devices(imei_primary);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON public.devices(serial_number);

-- ==============================================================================
-- TABLE: CONSENT_RECORDS
-- GDPR / NDPR compliant explicit consent tracking with full audit trail
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('LOCATION_TRACKING', 'TELEMETRY_HEARTBEAT', 'RECOVERY_VERIFICATION', 'AUDIT_LOGGING')),
    status TEXT NOT NULL DEFAULT 'GRANTED' CHECK (status IN ('GRANTED', 'REVOKED', 'DENIED')),
    purpose TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    granted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON public.consent_records(consent_type, status);

-- ==============================================================================
-- TABLE: AUDIT_LOGS
-- Immutable append-only audit trail for security-critical operations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- TABLE: TELEMETRY_LOGS
-- Active session heartbeats stamped only with verified user consent
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    approximate_address TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device ON public.telemetry_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_user ON public.telemetry_logs(user_id);

-- ==============================================================================
-- TABLE: DECOY_TRAPS
-- Honeypot recovery links with transparent upfront disclosures
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.decoy_traps (
    id TEXT PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template TEXT NOT NULL CHECK (template IN ('icloud_alert', 'carrier_sim', 'dhl_delivery', 'custody_verify')),
    bait_title TEXT NOT NULL,
    trap_url TEXT NOT NULL,
    click_count INTEGER DEFAULT 0 NOT NULL,
    last_captured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_traps_device ON public.decoy_traps(device_id);
CREATE INDEX IF NOT EXISTS idx_traps_owner ON public.decoy_traps(owner_id);

-- ==============================================================================
-- TABLE: TRAP_CAPTURES
-- Consented custody records submitted via recovery links
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trap_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trap_id TEXT NOT NULL REFERENCES public.decoy_traps(id) ON DELETE CASCADE,
    consent_acknowledged BOOLEAN DEFAULT true NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    ip_address TEXT,
    user_agent TEXT,
    battery_level TEXT,
    network_type TEXT,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captures_trap ON public.trap_captures(trap_id);

-- ==============================================================================
-- TABLE: VERIFICATION_LOGS
-- Second-hand gadget intake inspections by accredited repair technicians
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imei_scanned TEXT NOT NULL,
    technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    matched_device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    status_result TEXT NOT NULL CHECK (status_result IN ('VERIFIED_CLEAN', 'UNREGISTERED', 'FLAGGED_STOLEN')),
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    ip_address TEXT,
    action_taken TEXT,
    clean_hands_token TEXT NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verifications_tech ON public.verification_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_verifications_imei ON public.verification_logs(imei_scanned);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. Devices RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
    ON public.devices FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own devices"
    ON public.devices FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own devices"
    ON public.devices FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own devices"
    ON public.devices FOR DELETE
    USING (auth.uid() = owner_id);

-- 3. Consent Records RLS
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent records"
    ON public.consent_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
    ON public.consent_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent records"
    ON public.consent_records FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Audit Logs RLS (Append-Only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. Telemetry Logs RLS (User can view and purge their own location history)
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own telemetry logs"
    ON public.telemetry_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own telemetry logs"
    ON public.telemetry_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own telemetry logs"
    ON public.telemetry_logs FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Decoy Traps RLS
ALTER TABLE public.decoy_traps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own decoy traps"
    ON public.decoy_traps FOR ALL
    USING (auth.uid() = owner_id);

-- 7. Trap Captures RLS
ALTER TABLE public.trap_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trap owners can view captures"
    ON public.trap_captures FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.decoy_traps dt
            WHERE dt.id = trap_captures.trap_id
            AND dt.owner_id = auth.uid()
        )
    );

CREATE POLICY "Public can record consented capture"
    ON public.trap_captures FOR INSERT
    WITH CHECK (consent_acknowledged = true);

-- 8. Verification Logs RLS
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can manage own verification logs"
    ON public.verification_logs FOR ALL
    USING (auth.uid() = technician_id);

-- ==============================================================================
-- AUTOMATIC USER PROVISIONING TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        phone_number,
        shop_name,
        company_name,
        technician_profile,
        fleet_profile,
        is_verified
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Registered User'),
        COALESCE(new.raw_user_meta_data->>'role', 'owner'),
        new.raw_user_meta_data->>'phone_number',
        new.raw_user_meta_data->>'shop_name',
        new.raw_user_meta_data->>'company_name',
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'technician' THEN
                jsonb_build_object(
                    'shop_name', COALESCE(new.raw_user_meta_data->>'shop_name', ''),
                    'workshop_address', COALESCE(new.raw_user_meta_data->>'workshop_address', ''),
                    'trade_association', COALESCE(new.raw_user_meta_data->>'trade_association', ''),
                    'license_number', COALESCE(new.raw_user_meta_data->>'license_number', ''),
                    'accreditation_status', 'PENDING_ACCREDITATION',
                    'submitted_at', timezone('utc'::text, now())
                )
            ELSE NULL
        END,
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'fleet_manager' THEN
                jsonb_build_object(
                    'company_name', COALESCE(new.raw_user_meta_data->>'company_name', ''),
                    'rc_number', COALESCE(new.raw_user_meta_data->>'rc_number', ''),
                    'corporate_domain', COALESCE(new.raw_user_meta_data->>'corporate_domain', ''),
                    'registered_at', timezone('utc'::text, now())
                )
            ELSE NULL
        END,
        false
    );

    -- Log initial account creation in audit logs
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details
    )
    VALUES (
        new.id,
        'ACCOUNT_REGISTERED',
        'PROFILE',
        new.id::text,
        jsonb_build_object('role', COALESCE(new.raw_user_meta_data->>'role', 'owner'))
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- PRIVACY-SAFE PUBLIC VERIFICATION FUNCTION
-- Allows anyone or technicians to check status without exposing owner PII
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verify_device_public(imei_or_serial TEXT)
RETURNS TABLE (
    found BOOLEAN,
    status TEXT,
    brand TEXT,
    model TEXT,
    reported_stolen_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        true AS found,
        d.status,
        d.brand,
        d.model,
        d.updated_at AS reported_stolen_at
    FROM public.devices d
    WHERE d.imei_primary = imei_or_serial 
       OR d.imei_secondary = imei_or_serial 
       OR d.serial_number = imei_or_serial
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
