import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { verifyPassword } from "@/lib/password";
import { Users, Devices, Activity } from "@/lib/db";
import { getSession, adminPhones, isStaff, type Role } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/utils";

const Body = z.object({
  phone: z.string().min(5).max(20),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  const phone = normalizePhone(body.phone);
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  // brute-force protection: 10 tries / 10 min per IP+phone
  const rl = rateLimit(`login:${clientIp(req)}:${phone}`, 10, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "too_many", retryAfter: rl.retryAfter }, { status: 429 });
  }

  const existing = Users.byPhone(phone);
  if (!existing) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  if (existing.status !== "active") {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }
  if (!existing.passwordHash) {
    // accounts created in the old OTP era — they must set a password via forgot-password
    return NextResponse.json({ error: "no_password" }, { status: 400 });
  }
  if (!(await verifyPassword(body.password, existing.passwordHash))) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  let user = existing;
  // Owner phones always keep super_admin (first-time bootstrap).
  if (adminPhones().includes(phone) && user.role === "user") {
    Users.update(user.id, { role: "super_admin" });
    user = Users.byId(user.id)!;
  }

  const deviceId = Devices.create(user.id, req.headers.get("user-agent")?.slice(0, 120) || "Web");
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as Role;
  session.deviceId = deviceId;
  await session.save();

  Activity.log(user.id, "user_login", phone);
  return NextResponse.json({ ok: true, isStaff: isStaff(user.role) });
}
