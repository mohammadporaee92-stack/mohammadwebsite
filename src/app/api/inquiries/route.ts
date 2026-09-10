import { NextResponse } from "next/server";
import { z } from "zod";
import { Inquiries, Activity } from "@/lib/db";

const Body = z.object({
  name: z.string().min(2).max(100),
  company: z.string().max(120).optional(),
  email: z.string().email().max(120).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  country: z.string().max(60).optional(),
  projectType: z.string().max(80).optional(),
  budget: z.string().max(60).optional(),
  message: z.string().min(5).max(5000),
  unsure: z.union([z.boolean(), z.string()]).optional(),
});

export async function POST(req: Request) {
  try {
    const b = Body.parse(await req.json());
    Inquiries.create({
      name: b.name,
      company: b.company || null,
      email: b.email || null,
      phone: b.phone || null,
      country: b.country || null,
      projectType: b.projectType || null,
      budget: b.budget || null,
      message: b.message,
      unsure: b.unsure === true || b.unsure === "true" || b.unsure === "on",
    });
    Activity.log(null, "inquiry_received", `${b.name} — ${b.projectType || "general"}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
