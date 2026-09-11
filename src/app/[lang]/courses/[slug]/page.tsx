import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtNum } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Courses, Enroll, Progress, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { recordHistory } from "@/lib/history";
import { splitLines, excerptOf } from "@/lib/content";
import { paymentsEnabled } from "@/lib/payments";
import JsonLd from "@/components/JsonLd";
import { gradientFor } from "@/components/cards";
import { EnrollButton, BookmarkButton, NewsletterForm } from "@/components/forms";
import { cx } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const c = Courses.bySlug(slug);
  if (!c) return {};
  const title = pick(c, "title", l);
  const desc = pick(c, "desc", l) || excerptOf(pick(c, "desc", l));
  const url = absoluteUrl(`/${l}/courses/${slug}`);
  return {
    title, description: desc,
    alternates: { canonical: url, languages: { fa: absoluteUrl(`/fa/courses/${slug}`), en: absoluteUrl(`/en/courses/${slug}`) } },
    openGraph: { type: "website", title, description: desc, url },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const course = Courses.bySlug(slug);
  if (!course || course.status !== "published") notFound();

  const user = await getCurrentUser();
  const modules = Courses.modules(course.id).map((m) => ({ ...m, lessons: Courses.lessonsByModule(m.id) }));
  const allLessons = modules.flatMap((m) => m.lessons);
  const enrolled = user ? !!Enroll.get(user.id, course.id) : false;
  const doneIds = user && enrolled ? Progress.doneIdsForCourse(user.id, course.id) : new Set<string>();
  const progress = allLessons.length ? Math.round((doneIds.size / allLessons.length) * 100) : 0;
  const bookmarked = user ? Bookmarks.idsByUser(user.id).has(course.id) : false;
  const paidLocked = course.priceType === "paid" && !paymentsEnabled();
  const firstLesson = allLessons[0];

  if (user) {
    await recordHistory({
      userId: user.id, targetType: "course", targetId: course.id,
      title: pick(course, "title", lang), url: `/${lang}/courses/${slug}`,
    });
  }

  const levelLabel = course.level === "beginner" ? d.courses.levelBeginner : course.level === "advanced" ? d.courses.levelAdvanced : d.courses.levelIntermediate;

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name: pick(course, "title", lang),
        description: pick(course, "desc", lang),
        provider: { "@type": "Person", name: "Mohammad Poraee", url: absoluteUrl(`/${lang}/about`) },
        inLanguage: lang === "fa" ? "fa" : "en",
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
      }} />

      {/* hero */}
      <section className={cx("relative overflow-hidden text-white bg-gradient-to-br", gradientFor(course.slug))}>
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-300" aria-label="breadcrumb">
              <Link href={`/${lang}`} className="hover:text-white">{d.nav.home}</Link>
              <span>/</span>
              <Link href={`/${lang}/courses`} className="hover:text-white">{d.nav.courses}</Link>
            </nav>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className={cx("px-3 py-1 rounded-full", course.priceType === "free" ? "bg-emerald-500" : "bg-amber-400 text-navy-950")}>
                {course.priceType === "free" ? d.home.free : d.home.paid}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">{levelLabel}</span>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">📝 {d.courses.textBased}</span>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">{fmtNum(allLessons.length, lang)} {d.home.lessons}</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-[1.5]">{pick(course, "title", lang)}</h1>
            <p className="mt-3 text-slate-200 leading-8">{pick(course, "desc", lang)}</p>
            <p className="mt-4 text-sm text-slate-300">{d.courses.instructor}: <strong className="text-white">{course.instructor}</strong></p>
          </div>

          {/* enroll card */}
          <aside className="bg-white text-navy-900 rounded-3xl p-6 shadow-2xl h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold">
                {course.priceType === "free" ? d.home.free : lang === "fa" ? `${fmtNum(course.priceIrt || 0, lang)} تومان` : `$${course.priceUsd || 0}`}
              </p>
              <BookmarkButton targetType="course" targetId={course.id} initial={bookmarked} labels={{ save: d.common.save, saved: d.common.saved, login: d.common.loginNeeded }} />
            </div>
            {enrolled && (
              <div className="mt-3">
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-tech-500 to-sky-glow" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1.5 text-xs font-bold text-tech-600">{fmtNum(progress, lang)}٪ {d.dashboard.progress}</p>
              </div>
            )}
            <div className="mt-4 space-y-3">
              {enrolled ? (
                firstLesson && (
                  <Link href={`/${lang}/courses/${slug}/${firstLesson.id}`}
                    className="block text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-extrabold shadow-lg hover:brightness-110 transition">
                    {progress > 0 ? d.dashboard.continueCourse : d.hero.ctaStart}
                  </Link>
                )
              ) : paidLocked ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm font-bold text-amber-800 leading-6">{d.courses.paidSoon}</p>
                  <div className="mt-3 [&_input]:!bg-white [&_input]:!text-navy-900 [&_button]:!bg-navy-900 [&_button]:!text-white">
                    <NewsletterForm lang={lang} placeholder={d.home.newsletterPlaceholder} button={d.courses.notifyMe} done={d.home.newsletterDone} />
                  </div>
                </div>
              ) : !user ? (
                <Link href={`/${lang}/auth/login`}
                  className="block text-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-extrabold shadow-lg hover:brightness-110 transition">
                  {d.courses.loginToEnroll}
                </Link>
              ) : (
                <EnrollButton courseSlug={slug} labels={{ enroll: d.courses.enroll, enrolled: d.courses.enrolled, login: d.courses.loginToEnroll }} />
              )}
            </div>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>✓ {fmtNum(allLessons.length, lang)} {d.home.lessons}</li>
              <li>✓ 📝 {d.courses.textBased}</li>
              <li>✓ {lang === "fa" ? "دسترسی مادام‌العمر" : "Lifetime access"}</li>
            </ul>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
        <div className="space-y-8">
          {/* outcomes */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-extrabold text-navy-900 text-lg mb-4">{d.courses.outcomes}</h2>
            <ul className="grid sm:grid-cols-2 gap-2.5">
              {splitLines(pick(course, "outcomes", lang)).map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm text-slate-600 leading-6">
                  <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-extrabold shrink-0">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </section>

          {/* curriculum */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6" aria-label={d.courses.modules}>
            <h2 className="font-extrabold text-navy-900 text-lg mb-4">{d.courses.modules}</h2>
            <div className="space-y-4">
              {modules.map((m, mi) => (
                <div key={m.id} className="rounded-xl border border-slate-200 overflow-hidden">
                  <p className="bg-slate-50 px-4 py-3 font-extrabold text-navy-900 text-sm">
                    {fmtNum(mi + 1, lang)}. {pick(m, "title", lang)}
                  </p>
                  <ul className="divide-y divide-slate-100">
                    {m.lessons.map((l) => {
                      const locked = !l.isFree && !enrolled;
                      const done = doneIds.has(l.id);
                      return (
                        <li key={l.id}>
                          <Link
                            href={locked ? `/${lang}/courses/${slug}` : `/${lang}/courses/${slug}/${l.id}`}
                            className={cx("flex items-center justify-between gap-3 px-4 py-3 text-sm transition", locked ? "opacity-70" : "hover:bg-blue-50/50")}
                          >
                            <span className="flex items-center gap-2.5 font-semibold text-slate-700">
                              <span className={cx("grid place-items-center w-6 h-6 rounded-full text-xs font-extrabold shrink-0",
                                done ? "bg-emerald-500 text-white" : locked ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-tech-600")}>
                                {done ? "✓" : locked ? "🔒" : "📝"}
                              </span>
                              {pick(l, "title", lang)}
                              {l.isFree && <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{d.courses.freeLesson}</span>}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-extrabold text-navy-900 mb-3">{d.courses.audience}</h2>
            <ul className="space-y-2">
              {splitLines(pick(course, "audience", lang)).map((o) => (
                <li key={o} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-tech-500 font-extrabold">•</span>{o}</li>
              ))}
            </ul>
          </section>
          <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-extrabold text-navy-900 mb-3">{d.courses.prereq}</h2>
            <p className="text-sm text-slate-600 leading-7 whitespace-pre-line">{pick(course, "prereq", lang)}</p>
          </section>
        </div>
      </div>
    </>
  );
}
