import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { recipientContact } = await req.json();

    if (!recipientContact) {
      return NextResponse.json({ error: "Recipient required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      device_id: id,
      recipient: recipientContact,
      claim_token: `CLAIM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      initiated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Transfer failed" }, { status: 500 });
  }
}
