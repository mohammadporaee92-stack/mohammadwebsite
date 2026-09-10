import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeEmail } from "@/lib/newsletter";

const Body = z.object({
  email: z.string().email().max(120),
  lang: z.enum(["fa", "en"]).default("fa"),
});

export async function POST(req: Request) {
  try {
    const { email, lang } = Body.parse(await req.json());
    const r = await subscribeEmail(email, lang);
    return NextResponse.json(r);
  } catch {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
}
