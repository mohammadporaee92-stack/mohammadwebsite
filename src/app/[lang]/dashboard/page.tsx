import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang, pick, fmtNum, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Enroll, Courses, Progress, Bookmarks, History, Notifs } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CourseCard } from "@/components/cards";

export async function generateMetadata() {
  return { robots: { index: false, follow: false } };
}

export default async function DashboardHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const enrollments = Enroll.listByUser(user.id);
  const withProgress = enrollments.map((e) => {
    const done = Progress.doneIdsForCourse(user.id, e.course.id).size;
    const total = e.lessonCount;
    return { ...e, done, progress: total ? Math.round((done / total) * 100) : 0 };
  });
  const completed = withProgress.filter((e) => e.lessonCount > 0 && e.done >= e.lessonCount).length;
  const inProgress = withProgress.filter((e) => e.done < e.lessonCount);
  const saved = Bookmarks.listByUser(user.id);
  const history = History.listByUser(user.id, 6);
  const notifs = Notifs.listByUser(user.id, 5);
  const nextUp = inProgress[0];

  return (
    <div className="space-y-6">
      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: enrollments.length, l: d.dashboard.enrolled },
          { v: completed, l: d.dashboard.completed },
          { v: saved.length, l: d.dashboard.saved },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
            <p className="text-2xl font-extrabold text-navy-900">{fmtNum(s.v, lang)}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* continue */}
      {nextUp ? (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white p-6">
          <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="text-xs font-extrabold text-sky-glow tracking-wide">{d.dashboard.inProgress}</p>
              <h2 className="mt-1 font-extrabold text-lg leading-8">{pick(nextUp.course, "title", lang)}</h2>
              <div className="mt-2 h-2 w-56 max-w-full rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-glow to-emerald-400" style={{ width: `${nextUp.progress}%` }} />
              </div>
              <p className="mt-1 text-xs font-bold text-slate-300">{fmtNum(nextUp.progress, lang)}٪</p>
            </div>
            <Link href={`/${lang}/courses/${nextUp.course.slug}`}
              className="shrink-0 px-6 py-3 rounded-xl bg-white text-navy-900 font-extrabold hover:bg-blue-50 transition text-center">
              {d.dashboard.continueCourse}
            </Link>
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center">
          <p className="text-slate-500 font-semibold">{d.dashboard.noCourses}</p>
          <Link href={`/${lang}/courses`} className="mt-3 inline-block px-6 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
            {d.dashboard.browseCourses}
          </Link>
        </section>
      )}

      {/* my courses */}
      {withProgress.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-navy-900">{d.dashboard.myCourses}</h2>
            <Link href={`/${lang}/dashboard/courses`} className="text-sm font-bold text-tech-600">{d.home.viewAll}</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {withProgress.slice(0, 4).map((e) => (
              <CourseCard key={e.course.slug} lang={lang} course={e.course} lessonCount={e.lessonCount} progress={e.progress} />
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* history */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-navy-900 text-sm">{d.dashboard.history}</h2>
            <Link href={`/${lang}/dashboard/history`} className="text-xs font-bold text-tech-600">{d.home.viewAll}</Link>
          </div>
          {history.length > 0 ? (
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id as string}>
                  <Link href={(h.url as string).startsWith("/") ? (h.url as string) : `/${lang}`} className="block text-sm font-semibold text-slate-600 hover:text-tech-600 transition truncate">
                    {(h.title as string) || (h.url as string)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">{d.dashboard.noHistory}</p>
          )}
        </section>

        {/* notifications */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <h2 className="font-extrabold text-navy-900 text-sm mb-3">{d.dashboard.notifications}</h2>
          {notifs.length > 0 ? (
            <ul className="space-y-2.5">
              {notifs.map((n) => (
                <li key={n.id as string} className="text-sm bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="font-bold text-navy-900">{pick(n as unknown as Record<string, unknown>, "title", lang)}</p>
                  {Boolean(n.bodyFa || n.bodyEn) && <p className="text-slate-500 text-xs mt-0.5">{pick(n as unknown as Record<string, unknown>, "body", lang)}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">{fmtDate(n.createdAt as string, lang)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">{d.dashboard.noNotifications}</p>
          )}
        </section>
      </div>
    </div>
  );
}
