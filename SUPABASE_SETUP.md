# Gadgetshield - Supabase Production Setup Guide

Follow this quick 5-minute setup guide to connect your Supabase project for real-time authentication, Row Level Security (RLS), and privacy-compliant record keeping.

---

## Step 1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and log in or create an account.
2. Click **"New Project"**.
3. Select your organization and enter:
   - **Name**: `gadgetshield` (or any name you prefer)
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose the region closest to your users (e.g., `West Europe (London)` or `US East`).
4. Click **"Create new project"** and wait ~2 minutes for provisioning to finish.

---

## Step 2: Deploy the Database Schema & RLS in 1 Click
1. In your Supabase dashboard, navigate to the **SQL Editor** (icon with `>_` on the left sidebar).
2. Click **"New query"**.
3. Open [`supabase/schema.sql`](file:///C:/Users/HP/Desktop/RupalShield/supabase/schema.sql) in this repository, copy the entire SQL code, and paste it into the query editor.
4. Click **"Run"** (or press `Ctrl + Enter`).
5. You should see `Success. No rows returned`.

> [!NOTE]
> This automatically creates:
> - `profiles` table with role-based access control (`owner`, `technician`, `fleet_manager`).
> - `devices` table with strict Row Level Security (users only see their own registered gadgets).
> - `consent_records` for GDPR/NDPR location consent tracking and revocations.
> - `audit_logs` table (append-only cryptographic security audit trail).
> - `telemetry_logs` with user-managed retention and 1-click purge support.
> - `decoy_traps` and `trap_captures` for honeypot recovery links with transparent upfront disclosures.
> - `verification_logs` for accredited repair technicians.
> - Automatic user trigger: every new user who signs up automatically receives a profile row.
> - `verify_device_public` secure function allowing anyone to check device status without exposing owner personal information or coordinates.

---

## Step 3: Configure Authentication Settings
1. Go to **Authentication** -> **Providers** -> **Email**.
2. Ensure **"Enable Email provider"** is switched **ON**.
3. For fast local testing / development:
   - You can toggle **"Confirm email"** to **OFF** if you want users to log in immediately without waiting for email verification links.
   - For production, keep it **ON**.
4. (Optional) Under **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your live Vercel domain e.g., `https://rupalshield.vercel.app`).
   - Add `http://localhost:3000/**` to **Redirect URLs**.

---

## Step 4: Link API Keys to Your Application
1. In the Supabase dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Find the **Project URL** and the **`anon` `public` Key**.
3. Open or create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Restart your development server:
```bash
npm run dev
```

---

## Step 5: Verification Checklist
- [x] Register a new user at `/login` -> Profile is created in Supabase `profiles` table.
- [x] Register a device -> Appears in Supabase `devices` table bound to your user ID.
- [x] Log in as a different user -> Verified that other users cannot see your registered devices (enforced by RLS).
- [x] Grant or revoke location consent -> Recorded in `consent_records` and `audit_logs`.
- [x] Offline fallback: If internet is down or keys are not yet configured, the local zero-crash hybrid storage preserves state seamlessly.
