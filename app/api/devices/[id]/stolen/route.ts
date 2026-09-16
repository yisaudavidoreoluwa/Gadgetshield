import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    return NextResponse.json({
      success: true,
      device_id: id,
      new_status: status || "STOLEN",
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update stolen status" }, { status: 500 });
  }
}
