import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ devices: [] });
    }

    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching user devices:", error.message);
      return NextResponse.json({ devices: [] });
    }

    return NextResponse.json({ devices: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load devices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.brand || !body.model || !body.imei_primary) {
      return NextResponse.json({ error: "Missing required device attributes" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const ownerId = user?.id || body.owner_id;
    if (!ownerId) {
      return NextResponse.json({ error: "User authentication required to register device" }, { status: 401 });
    }

    // Live Supabase insert
    const { data, error } = await supabase.from("devices").insert({
      owner_id: ownerId,
      brand: body.brand.trim(),
      model: body.model.trim(),
      imei_primary: body.imei_primary.trim(),
      imei_secondary: body.imei_secondary ? body.imei_secondary.trim() : null,
      serial_number: body.serial_number ? body.serial_number.trim() : null,
      purchase_receipt_url: body.purchase_receipt_url || null,
      status: "CLEAN",
    }).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create device" }, { status: 500 });
  }
}
