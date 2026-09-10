import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { verifyOtp } from "@/lib/otp";
import { Users, Devices, Notifs, Activity } from "@/lib/db";
import { getSession, adminPhones, isStaff, type Role } from "@/lib/session";

const Body = z.object({
  phone: z.string().min(5).max(20),
  code: z.string().min(4).max(8),
  name: z.string().max(80).optional(),
  lang: z.enum(["fa", "en"]).optional(),
});

export async function POST(req: Request) {
  try {
    const { phone: raw, code, name, lang } = Body.parse(await req.json());
    const phone = normalizePhone(raw);
    if (!phone) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    const check = await verifyOtp(phone, code);
    if (!check.ok) {
      return NextResponse.json(check, { status: 400 });
    }

    let user = Users.byPhone(phone);
    let isNew = false;
    if (!user) {
      isNew = true;
      const role: Role = adminPhones().includes(phone) ? "super_admin" : "user";
      user = Users.create({ phone, name: name?.trim() || null, role, preferredLang: lang || "fa" });
      Notifs.create({
        userId: user.id,
        titleFa: "به پورای‌آی خوش آمدی!",
        titleEn: "Welcome to PorAI!",
        bodyFa: "از داشبورد می‌توانی دوره‌ها را شروع و محتوای موردعلاقه‌ات را ذخیره کنی.",
        bodyEn: "From your dashboard you can start courses and save favorite content.",
      });
    } else {
      if (user.status !== "active") {
        return NextResponse.json({ error: "disabled" }, { status: 403 });
      }
      // Owner phones always keep super_admin (first-time bootstrap).
      const updates: Record<string, unknown> = {};
      if (adminPhones().includes(phone) && user.role === "user") {
        updates.role = "super_admin";
      }
      if (name?.trim() && !user.name) updates.name = name.trim();
      if (Object.keys(updates).length > 0) {
        Users.update(user.id, updates as { role: string });
        user = Users.byId(user.id)!;
      }
    }

    const deviceId = Devices.create(user.id, req.headers.get("user-agent")?.slice(0, 120) || "Web");

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role as Role;
    session.deviceId = deviceId;
    await session.save();

    Activity.log(user.id, isNew ? "user_registered" : "user_login", phone);

    return NextResponse.json({ ok: true, isStaff: isStaff(user.role) });
  } catch {
    return NextResponse.json({ error: "wrong_code" }, { status: 400 });
  }
}
