-- =============================================================================
-- RupalShield Database Schema & RLS Policies
-- Anti-Theft Gadget Registry & Technician Silent Verification Engine
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'technician', 'admin');
CREATE TYPE device_status AS ENUM ('CLEAN', 'STOLEN', 'RECOVERED', 'TRANSFERRED');
CREATE TYPE verification_action AS ENUM ('INTAKE_HOLD', 'SERVICE_DECLINED', 'CLEAN_INTAKE');

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'owner',
    full_name TEXT NOT NULL,
    phone_number TEXT,
    shop_name TEXT,
    market_location TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. DEVICES TABLE
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    imei_primary VARCHAR(15) NOT NULL UNIQUE,
    imei_secondary VARCHAR(15) UNIQUE,
    serial_number TEXT,
    status device_status NOT NULL DEFAULT 'CLEAN',
    purchase_receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT imei_primary_format CHECK (imei_primary ~ '^[0-9]{14,16}$')
);

-- 4. THEFT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.theft_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    incident_description TEXT,
    contact_email_phone TEXT NOT NULL,
    bounty_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 5. VERIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imei_scanned TEXT NOT NULL,
    technician_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    matched_device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    status_result TEXT NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    ip_address TEXT,
    action_taken verification_action,
    clean_hands_token UUID NOT NULL DEFAULT gen_random_uuid(),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_devices_imei_primary ON public.devices(imei_primary);
CREATE INDEX IF NOT EXISTS idx_devices_imei_secondary ON public.devices(imei_secondary) WHERE imei_secondary IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_serial ON public.devices(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON public.devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_theft_reports_device_id ON public.theft_reports(device_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_tech ON public.verification_logs(technician_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_imei ON public.verification_logs(imei_scanned);
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_clean_hands_token ON public.verification_logs(clean_hands_token);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theft_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Technicians and Admins can view technician directory" ON public.profiles;
CREATE POLICY "Technicians and Admins can view technician directory"
    ON public.profiles FOR SELECT
    USING (role IN ('technician', 'admin'));

-- Devices Policies
DROP POLICY IF EXISTS "Owners can view their registered devices" ON public.devices;
CREATE POLICY "Owners can view their registered devices"
    ON public.devices FOR SELECT
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert new devices" ON public.devices;
CREATE POLICY "Owners can insert new devices"
    ON public.devices FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their own devices" ON public.devices;
CREATE POLICY "Owners can update their own devices"
    ON public.devices FOR UPDATE
    USING (auth.uid() = owner_id);

-- Theft Reports Policies
DROP POLICY IF EXISTS "Owners can view theft reports for their devices" ON public.theft_reports;
CREATE POLICY "Owners can view theft reports for their devices"
    ON public.theft_reports FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.devices 
        WHERE devices.id = theft_reports.device_id AND devices.owner_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Owners can create theft reports for their devices" ON public.theft_reports;
CREATE POLICY "Owners can create theft reports for their devices"
    ON public.theft_reports FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.devices 
        WHERE devices.id = theft_reports.device_id AND devices.owner_id = auth.uid()
    ));

-- Verification Logs Policies
DROP POLICY IF EXISTS "Technicians can view their own verification logs" ON public.verification_logs;
CREATE POLICY "Technicians can view their own verification logs"
    ON public.verification_logs FOR SELECT
    USING (auth.uid() = technician_id);

DROP POLICY IF EXISTS "Technicians can insert verification logs" ON public.verification_logs;
CREATE POLICY "Technicians can insert verification logs"
    ON public.verification_logs FOR INSERT
    WITH CHECK (auth.uid() = technician_id);

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous User'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'owner')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure Stealth Verification RPC
CREATE OR REPLACE FUNCTION public.verify_and_log_scan(
    p_identifier TEXT,
    p_lat DOUBLE PRECISION DEFAULT NULL,
    p_lng DOUBLE PRECISION DEFAULT NULL,
    p_ip TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_device public.devices%ROWTYPE;
    v_clean_hands_id UUID;
    v_status_result TEXT;
    v_tech_id UUID;
BEGIN
    v_tech_id := auth.uid();
    IF v_tech_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    p_identifier := regexp_replace(p_identifier, '[^a-zA-Z0-9]', '', 'g');

    SELECT * INTO v_device
    FROM public.devices
    WHERE imei_primary = p_identifier 
       OR imei_secondary = p_identifier 
       OR serial_number = p_identifier
    LIMIT 1;

    IF FOUND THEN
        IF v_device.status = 'STOLEN' THEN
            v_status_result := 'FLAGGED_STOLEN';
        ELSE
            v_status_result := 'VERIFIED_CLEAN';
        END IF;
    ELSE
        v_status_result := 'UNREGISTERED';
    END IF;

    INSERT INTO public.verification_logs (
        imei_scanned,
        technician_id,
        matched_device_id,
        status_result,
        location_lat,
        location_lng,
        ip_address
    ) VALUES (
        p_identifier,
        v_tech_id,
        v_device.id,
        v_status_result,
        p_lat,
        p_lng,
        p_ip
    )
    RETURNING clean_hands_token INTO v_clean_hands_id;

    RETURN jsonb_build_object(
        'status', v_status_result,
        'matched_device_id', v_device.id,
        'brand', v_device.brand,
        'model', v_device.model,
        'clean_hands_token', v_clean_hands_id,
        'scanned_at', TIMEZONE('utc', NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
