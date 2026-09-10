import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Enroll, Progress } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CourseCard } from "@/components/cards";

export default async function DashboardCourses({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const enrollments = Enroll.listByUser(user.id).map((e) => {
    const done = Progress.doneIdsForCourse(user.id, e.course.id).size;
    return { ...e, progress: e.lessonCount ? Math.round((done / e.lessonCount) * 100) : 0 };
  });

  return (
    <div>
      <h2 className="font-extrabold text-navy-900 text-lg mb-4">{d.dashboard.myCourses}</h2>
      {enrollments.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {enrollments.map((e) => (
            <CourseCard key={e.course.slug} lang={lang} course={e.course} lessonCount={e.lessonCount} progress={e.progress} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
          <p className="text-slate-500 font-semibold">{d.dashboard.noCourses}</p>
          <Link href={`/${lang}/courses`} className="mt-3 inline-block px-6 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold">
            {d.dashboard.browseCourses}
          </Link>
        </div>
      )}
    </div>
  );
}
