import { NextResponse } from "next/server";
import { z } from "zod";
import { Bookmarks } from "@/lib/db";
import { getSession } from "@/lib/session";

const Body = z.object({
  targetType: z.enum(["article", "course", "tool", "project"]),
  targetId: z.string().min(3),
});

// Toggle bookmark
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { targetType, targetId } = Body.parse(await req.json());
    const bookmarked = Bookmarks.toggle(session.userId, targetType, targetId);
    return NextResponse.json({ bookmarked });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
