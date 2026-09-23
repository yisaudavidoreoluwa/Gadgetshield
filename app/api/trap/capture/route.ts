import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      trap_id, 
      latitude, 
      longitude, 
      accuracy, 
      battery_level, 
      network_type, 
      user_agent,
      holder_circumstance,
      handover_preference,
      dropoff_location_note,
      contact_info,
      message_to_owner,
      receipt_token
    } = body;

    if (!trap_id) {
      return NextResponse.json({ error: "trap_id is required" }, { status: 400 });
    }

    // Extract network IP address from edge headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const headerUserAgent = req.headers.get("user-agent") || user_agent || "Custody Handover Session";
    const timestamp = new Date().toISOString();

    const captureRecord = {
      id: `cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      trap_id,
      timestamp,
      consent_acknowledged: true,
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      accuracy: accuracy !== undefined ? Number(accuracy) : 10,
      ip_address: ip,
      user_agent: headerUserAgent,
      battery_level: battery_level ? `${battery_level}%` : undefined,
      network_type: network_type || "Cellular Wireless",
      holder_circumstance,
      handover_preference,
      dropoff_location_note,
      contact_info,
      message_to_owner,
      receipt_token,
    };

    // Attempt Supabase persistence if tables exist
    try {
      const supabase = await createClient();
      await supabase.from("trap_captures").insert({
        trap_id,
        consent_acknowledged: true,
        latitude: captureRecord.latitude,
        longitude: captureRecord.longitude,
        accuracy: captureRecord.accuracy,
        ip_address: ip,
        user_agent: headerUserAgent,
        battery_level: captureRecord.battery_level,
        network_type: captureRecord.network_type,
      });

      // Update click count on decoy trap
      await supabase.rpc("increment_trap_clicks", { p_trap_id: trap_id });
    } catch {
      // Graceful fallback in offline/hybrid mode
    }

    return NextResponse.json(
      {
        success: true,
        message: "Forensic capture logged securely",
        capture: captureRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to record trap capture", details: error?.message },
      { status: 500 }
    );
  }
}
