import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Device ID required" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      const { data: device, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && device) {
        return NextResponse.json({ device });
      }
    } catch {}

    return NextResponse.json({ device: null }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load device" }, { status: 500 });
  }
}
