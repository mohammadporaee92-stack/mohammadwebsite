import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { verifyOtp } from "@/lib/otp";
import { hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { Users, Activity } from "@/lib/db";

const Body = z.object({
  phone: z.string().min(5).max(20),
  code: z.string().min(4).max(8),
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
  const user = Users.byPhone(phone);
  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  if (!isPasswordStrongEnough(body.password)) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }
  const check = await verifyOtp(phone, body.code);
  if (!check.ok) {
    return NextResponse.json(check, { status: 400 });
  }
  Users.update(user.id, { passwordHash: await hashPassword(body.password) });
  Activity.log(user.id, "password_reset", phone);
  return NextResponse.json({ ok: true });
}
