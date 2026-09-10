import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { requestOtp } from "@/lib/otp";
import { clientIp } from "@/lib/utils";

const Body = z.object({ phone: z.string().min(5).max(20) });

export async function POST(req: Request) {
  try {
    const { phone: raw } = Body.parse(await req.json());
    const phone = normalizePhone(raw);
    if (!phone) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    const result = await requestOtp(phone, clientIp(req));
    if (!result.ok) {
      return NextResponse.json(result, { status: 429 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
}
