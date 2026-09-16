import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { cleanHandsToken, action } = await req.json();

    if (!cleanHandsToken || !action) {
      return NextResponse.json({ error: "Missing token or action" }, { status: 400 });
    }

    // Telemetry log output
    console.log(`[STEALTH PROTOCOL ACTION] Token: ${cleanHandsToken} | Action: ${action} | Time: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      clean_hands_token: cleanHandsToken,
      action_logged: action,
      recorded_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Action recording failed" }, { status: 500 });
  }
}
