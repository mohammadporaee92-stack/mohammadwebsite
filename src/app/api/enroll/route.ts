import { NextResponse } from "next/server";
import { z } from "zod";
import { Courses, Enroll, Notifs } from "@/lib/db";
import { getSession } from "@/lib/session";

const Body = z.object({ courseSlug: z.string().min(2) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { courseSlug } = Body.parse(await req.json());
    const course = Courses.bySlug(courseSlug);
    if (!course || course.status !== "published") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (course.priceType === "paid") {
      // Only a future verified checkout may grant access to paid courses.
      return NextResponse.json({ error: "paid_disabled" }, { status: 402 });
    }
    Enroll.create(session.userId, course.id);
    Notifs.create({
      userId: session.userId,
      titleFa: `ثبت‌نام در دوره «${course.titleFa}»`,
      titleEn: `Enrolled in "${course.titleEn}"`,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
