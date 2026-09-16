import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, description, bounty } = await req.json();

    const targetStatus = status || "STOLEN";
    const supabase = await createClient();

    // 1. Update device status
    const { error: updateError } = await supabase
      .from("devices")
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      console.warn("Device status update error:", updateError.message);
    }

    // 2. If flagged STOLEN, insert a theft report
    if (targetStatus === "STOLEN") {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("theft_reports").insert({
        device_id: id,
        incident_description: description || "Reported stolen via owner portal",
        contact_email_phone: user?.email || "Registry Broadcast",
        bounty_amount: bounty || 0,
      });
    }

    return NextResponse.json({
      success: true,
      device_id: id,
      new_status: targetStatus,
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update stolen status" }, { status: 500 });
  }
}
