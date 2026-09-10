import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { Devices } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (session.deviceId) {
    try { Devices.remove(session.deviceId); } catch { /* ignore */ }
  }
  session.destroy();
  return NextResponse.json({ ok: true });
}
