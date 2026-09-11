import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { hashPassword, isPasswordStrongEnough } from "@/lib/password";
import { Users, Devices, Notifs, Activity } from "@/lib/db";
import { getSession, adminPhones, isStaff, type Role } from "@/lib/session";

const Body = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(5).max(20),
  password: z.string().min(1).max(128),
  lang: z.enum(["fa", "en"]).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit("register:" + clientIp(req), 5, 10 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "too_many" }, { status: 429 });
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  const name = body.name.trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  const phone = normalizePhone(body.phone);
  if (!phone) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  if (!isPasswordStrongEnough(body.password)) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }
  if (Users.byPhone(phone)) {
    return NextResponse.json({ error: "user_exists" }, { status: 409 });
  }

  if (adminPhones().includes(phone)) return NextResponse.json({ error: "registration_unavailable" }, { status: 403 });
  const role: Role = "user";
  const user = Users.create({
    phone,
    name,
    role,
    preferredLang: body.lang || "fa",
    passwordHash: await hashPassword(body.password),
  });
  Notifs.create({
    userId: user.id,
    titleFa: "به سایت خوش آمدی!",
    titleEn: "Welcome!",
    bodyFa: "از داشبورد می‌توانی دوره‌ها را شروع و محتوای موردعلاقه‌ات را ذخیره کنی.",
    bodyEn: "From your dashboard you can start courses and save favorite content.",
  });

  const deviceId = Devices.create(user.id, req.headers.get("user-agent")?.slice(0, 120) || "Web");
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as Role;
  session.deviceId = deviceId;
  await session.save();

  Activity.log(user.id, "user_registered", phone);
  return NextResponse.json({ ok: true, isStaff: isStaff(user.role) });
}
