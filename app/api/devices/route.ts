import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.brand || !body.model || !body.imei_primary) {
      return NextResponse.json({ error: "Missing required device attributes" }, { status: 400 });
    }

    // Try live Supabase insert
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
        const supabase = await createClient();
        const { data, error } = await supabase.from("devices").insert({
          brand: body.brand,
          model: body.model,
          imei_primary: body.imei_primary,
          imei_secondary: body.imei_secondary || null,
          serial_number: body.serial_number || null,
          purchase_receipt_url: body.purchase_receipt_url || null,
          status: "CLEAN",
        }).select().single();

        if (!error && data) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fall through to mock response
    }

    const newDevice = {
      id: `dev-${Date.now()}`,
      brand: body.brand,
      model: body.model,
      imei_primary: body.imei_primary,
      imei_secondary: body.imei_secondary || null,
      serial_number: body.serial_number || null,
      purchase_receipt_url: body.purchase_receipt_url || null,
      status: "CLEAN",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(newDevice);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create device" }, { status: 500 });
  }
}
