import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { identifier, latitude, longitude } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Identifier required" }, { status: 400 });
    }

    const clean = identifier.replace(/[^0-9A-Za-z]/g, "");

    // Extract Client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const cleanHandsToken = `CHT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // 1. Query Supabase Real Database
    try {
      const supabase = await createClient();

      // Check public.devices for matching IMEI or Serial
      const { data: matchedDevice, error: devErr } = await supabase
        .from("devices")
        .select("id, brand, model, status, owner_id")
        .or(`imei_primary.eq.${clean},imei_secondary.eq.${clean},serial_number.eq.${clean}`)
        .maybeSingle();

      if (!devErr && matchedDevice) {
        const statusResult = matchedDevice.status === "STOLEN" ? "FLAGGED_STOLEN" : "VERIFIED_CLEAN";

        // Record verification log in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            await supabase.from("verification_logs").insert({
              imei_scanned: clean,
              technician_id: user.id,
              matched_device_id: matchedDevice.id,
              status_result: statusResult,
              location_lat: latitude ?? null,
              location_lng: longitude ?? null,
              ip_address: ip,
              clean_hands_token: cleanHandsToken,
            });
          } catch {
            // Non-critical logging error
          }
        }

        return NextResponse.json({
          status: statusResult,
          matched_device_id: matchedDevice.id,
          brand: matchedDevice.brand,
          model: matchedDevice.model,
          clean_hands_token: cleanHandsToken,
          scanned_at: timestamp,
        });
      }
    } catch (dbErr) {
      console.warn("Supabase scan query skipped or offline:", dbErr);
    }

    // Default: Device is not registered in the database
    return NextResponse.json({
      status: "UNREGISTERED",
      matched_device_id: null,
      brand: undefined,
      model: undefined,
      clean_hands_token: cleanHandsToken,
      scanned_at: timestamp,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Scan engine error" }, { status: 500 });
  }
}
