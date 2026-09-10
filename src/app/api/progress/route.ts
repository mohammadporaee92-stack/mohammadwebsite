import { NextResponse } from "next/server";
import { z } from "zod";
import { Courses, Enroll, Progress } from "@/lib/db";
import { getSession } from "@/lib/session";

const Body = z.object({ lessonId: z.string().min(3), done: z.boolean() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { lessonId, done } = Body.parse(await req.json());
    const lesson = Courses.lessonById(lessonId);
    if (!lesson) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const enrolled = Enroll.get(session.userId, lesson.courseId);
    if (!enrolled && !lesson.isFree) {
      return NextResponse.json({ error: "not_enrolled" }, { status: 403 });
    }
    Progress.set(session.userId, lessonId, done);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
