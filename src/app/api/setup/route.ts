import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { one } from "@/lib/db";
import { runAllSeeds } from "@/lib/seeds";

// One-time production setup: fills an empty database with the starter content.
// Usage (once, right after first deploy):
//   https://YOUR-DOMAIN/api/setup?secret=SETUP_SECRET
// Disabled when SETUP_SECRET env is not set. Refuses to run when content exists
// (unless &force=1) so it can never wipe a live site by accident.
export async function GET(req: NextRequest) {
  const configured = process.env.SETUP_SECRET || "";
  if (!configured) return NextResponse.json({ ok: false }, { status: 404 });
  const given = req.nextUrl.searchParams.get("secret") || "";
  const a = Buffer.from(given);
  const b = Buffer.from(configured);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const existing = (one<{ n: number }>("SELECT COUNT(*) n FROM articles")?.n ?? 0) as number;
  if (existing > 0 && req.nextUrl.searchParams.get("force") !== "1") {
    return NextResponse.json({ ok: false, error: "already_seeded", articles: existing });
  }
  // The seed upserts in place, so it is safe to re-run (content is refreshed, users kept).
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
