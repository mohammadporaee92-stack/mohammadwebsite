import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { one } from "@/lib/db";
import { runAllSeeds } from "@/lib/seeds";

// Optional first setup for an empty database. Never put the secret in a URL.
export async function POST(req: NextRequest) {
  const configured = process.env.SETUP_SECRET || "";
  if (!configured) return NextResponse.json({ ok: false }, { status: 404 });
  const given = req.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  const a = Buffer.from(given);
  const b = Buffer.from(configured);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const existing = (one<{ n: number }>("SELECT COUNT(*) n FROM articles")?.n ?? 0) as number;
  if (existing > 0) {
    return NextResponse.json({ ok: false, error: "already_seeded", articles: existing });
  }
  // Existing installations use the local brand:refresh command; no remote force reset.
  await runAllSeeds();
  const counts = {
    articles: (one<{ n: number }>("SELECT COUNT(*) n FROM articles")?.n ?? 0) as number,
    courses: (one<{ n: number }>("SELECT COUNT(*) n FROM courses")?.n ?? 0) as number,
    lessons: (one<{ n: number }>("SELECT COUNT(*) n FROM lessons")?.n ?? 0) as number,
    tools: (one<{ n: number }>("SELECT COUNT(*) n FROM tools")?.n ?? 0) as number,
    projects: (one<{ n: number }>("SELECT COUNT(*) n FROM projects")?.n ?? 0) as number,
  };
  return NextResponse.json({ ok: true, ...counts });
}
