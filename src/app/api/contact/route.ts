import { NextResponse } from "next/server";
import { z } from "zod";
import { Messages, Activity } from "@/lib/db";

const Body = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(120),
  subject: z.string().max(160).optional(),
  message: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    Messages.create({ name: b.name, email: b.email, subject: b.subject || null, message: b.message });
    Activity.log(null, "contact_received", b.name);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
