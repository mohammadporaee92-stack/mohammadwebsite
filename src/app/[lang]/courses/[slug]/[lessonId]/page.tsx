import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang, pick, fmtNum } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Courses, Enroll, Progress } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { renderRich } from "@/lib/content";
import { LessonCompleteButton } from "@/components/forms";
import { cx } from "@/lib/utils";

export default async function LessonPage({ params }: { params: Promise<{ lang: string; slug: string; lessonId: string }> }) {
  const { lang: raw, slug, lessonId } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const course = Courses.bySlug(slug);
  if (!course || course.status !== "published") notFound();
  const lesson = Courses.lessonById(lessonId);
  if (!lesson || lesson.courseId !== course.id) notFound();

  const user = await getCurrentUser();
  const enrolled = user ? !!Enroll.get(user.id, course.id) : false;
  if (!lesson.isFree && !enrolled) {
    redirect(`/${lang}/courses/${slug}`);
  }

  const modules = Courses.modules(course.id).map((m) => ({ ...m, lessons: Courses.lessonsByModule(m.id) }));
  const flat = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: pick(m, "title", lang) })));
  const idx = flat.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const done = user ? Progress.isDone(user.id, lesson.id) : false;
  const attachments = Courses.attachments(lesson.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
      <div>
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4" aria-label="breadcrumb">
          <Link href={`/${lang}/courses`} className="hover:text-navy-900">{d.nav.courses}</Link>
          <span>/</span>
          <Link href={`/${lang}/courses/${slug}`} className="hover:text-navy-900">{pick(course, "title", lang)}</Link>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 leading-snug">{pick(lesson, "title", lang)}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-tech-600 text-xs font-extrabold">📝 {d.courses.textBased}</span>
          <span>{fmtNum(lesson.durationMin, lang)} {d.home.min} · {flat[idx]?.moduleTitle}</span>
        </p>

        {(pick(lesson, "body", lang)) && (
          <article className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8">
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: renderRich(pick(lesson, "body", lang)) }} />
          </article>
        )}

        {attachments.length > 0 && (
          <section className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-extrabold text-navy-900 mb-3">{lang === "fa" ? "فایل‌های ضمیمه" : "Attachments"}</h2>
            <ul className="space-y-2">
              {attachments.map((a) => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm font-bold text-tech-600 hover:text-tech-500">
                    📎 {a.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            {user ? (
              <LessonCompleteButton lessonId={lesson.id} initial={done} labels={{ mark: d.courses.markDone, done: d.courses.completed }} />
            ) : (
              <Link href={`/${lang}/auth/login`} className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold">{d.courses.loginToEnroll}</Link>
            )}
          </div>
          <div className="flex gap-2">
            {prev && (prev.isFree || enrolled) && (
              <Link href={`/${lang}/courses/${slug}/${prev.id}`} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold hover:border-navy-900 transition">→ {pick(prev, "title", lang).slice(0, 20)}…</Link>
            )}
            {next && (next.isFree || enrolled) && (
              <Link href={`/${lang}/courses/${slug}/${next.id}`} className="px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">{pick(next, "title", lang).slice(0, 20)}… ←</Link>
            )}
          </div>
        </div>
      </div>

      {/* curriculum sidebar */}
      <aside className="bg-white rounded-2xl border border-slate-200/80 p-4 h-fit lg:sticky lg:top-24 max-h-[80vh] overflow-auto">
        <p className="font-extrabold text-navy-900 text-sm px-2 mb-3">{d.courses.modules}</p>
        <div className="space-y-3">
          {modules.map((m) => (
            <div key={m.id}>
              <p className="text-xs font-extrabold text-slate-500 px-2 mb-1">{pick(m, "title", lang)}</p>
              <ul className="space-y-1">
                {m.lessons.map((l) => {
                  const locked = !l.isFree && !enrolled;
                  const active = l.id === lesson.id;
                  return (
                    <li key={l.id}>
                      <Link href={locked ? `/${lang}/courses/${slug}` : `/${lang}/courses/${slug}/${l.id}`}
                        className={cx("block text-xs font-semibold rounded-lg px-3 py-2 transition",
                          active ? "bg-navy-900 text-white" : locked ? "text-slate-400" : "text-slate-600 hover:bg-blue-50")}>
                        {locked ? "🔒 " : ""}{pick(l, "title", lang)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
