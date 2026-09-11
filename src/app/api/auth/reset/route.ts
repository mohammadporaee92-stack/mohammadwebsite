import { NextResponse } from "next/server";

// SMS recovery is disabled for this password-based edition.
export async function POST() {
  return NextResponse.json({ error: "sms_disabled" }, { status: 410 });
}
