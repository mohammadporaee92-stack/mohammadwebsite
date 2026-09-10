import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Cats, Courses, Articles, Tools, Projects, Journey, Users, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import JsonLd from "@/components/JsonLd";
import {
  SectionHeading, ProfilePhoto, CourseCard, ArticleCard, ToolCard,
  ProjectCard, CategoryCard, Stats, CTAWork, InstagramSection,
} from "@/components/cards";
import { NewsletterForm } from "@/components/forms";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const user = await getCurrentUser();
  const settings = await getSettings(["instagram", "site_name_fa", "site_name_en"]);

  const cats = Cats.withArticleCounts("tutorial").slice(0, 8);
  const courses = Courses.list({ status: "published", limit: 3 });
  const latestTutorials = Articles.list({ kind: "tutorial", status: "published", limit: 3 });
  const latestArticles = Articles.list({ kind: "article", status: "published", limit: 3 });
  const tools = Tools.list({ status: "published", limit: 3 });
  const projects = Projects.list({ status: "published", limit: 3 });
  const journey = Journey.published(3);
  const counts = {
    users: Users.count(),
    articles: Articles.count({ status: "published" }),
    courses: Courses.count({ status: "published" }),
    tools: Tools.count({ status: "published" }),
  };
  const bookmarked = user ? Bookmarks.idsByUser(user.id) : new Set<string>();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mohammad Poraee",
    alternateName: "محمد پرایی",
    jobTitle: lang === "fa" ? "مهندس برق و مدرس هوش مصنوعی" : "Electrical Engineer & AI Educator",
    alumniOf: { "@type": "CollegeOrUniversity", name: "K. N. Toosi University of Technology" },
    url: absoluteUrl(`/${lang}/about`),
    sameAs: [`https://instagram.com/${settings.instagram || "mohammad_por_ai"}`],
  };

  return (
    <>
      <JsonLd data={personSchema} />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="absolute -top-32 start-1/4 w-96 h-96 rounded-full bg-tech-500/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-40 end-0 w-[28rem] h-[28rem] rounded-full bg-sky-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wide bg-white/10 border border-white/15 rounded-full px-4 py-2 text-sky-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {d.hero.badge} · PorAI
            </p>
            <p className="mt-5 text-lg font-bold text-sky-glow">
              {lang === "fa" ? "محمد پرایی" : "Mohammad Poraee"}
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.25]">
              {d.hero.titleA}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-sky-glow via-blue-400 to-tech-400">
                {d.hero.titleB}
              </span>
            </h1>
            <p className="mt-5 text-slate-300 leading-8 max-w-xl">{d.hero.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${lang}/learn`} className="px-7 py-3.5 rounded-xl bg-white text-navy-900 font-extrabold hover:bg-blue-50 transition shadow-xl">
                {d.hero.ctaStart}
              </Link>
              <Link href={`/${lang}/courses`} className="px-7 py-3.5 rounded-xl border border-white/30 font-bold hover:bg-white/10 transition">
                {d.hero.ctaExplore}
              </Link>
              <Link href={`/${lang}/work`} className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 font-extrabold hover:brightness-110 transition shadow-lg shadow-blue-900/50">
                {d.hero.ctaWork}
              </Link>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-300 border-s-2 border-sky-glow ps-3">
              {d.hero.philosophy}
            </p>
          </div>

          <div className="relative flex justify-center lg:justify-end animate-fade-in">
            <div className="relative">
              <ProfilePhoto lang={lang} size="lg" />
              <div className="absolute -top-4 -start-6 bg-white text-navy-900 rounded-2xl shadow-xl px-4 py-2.5 text-xs font-extrabold animate-float">
                {lang === "fa" ? "🎓 ارشد برق — خواجه نصیر" : "🎓 MSc Electrical Eng."}
              </div>
              <div className="absolute -bottom-4 -end-4 bg-white text-navy-900 rounded-2xl shadow-xl px-4 py-2.5 text-xs font-extrabold animate-float" style={{ animationDelay: "1.5s" }}>
                {lang === "fa" ? "⚙️ صنعت نفت و گاز" : "⚙️ Oil & Gas Industry"}
              </div>
              <div className="absolute top-1/2 -end-8 hidden sm:block bg-navy-900/90 backdrop-blur border border-white/15 rounded-2xl px-4 py-2.5 text-xs font-bold text-sky-200 animate-float" style={{ animationDelay: "3s" }}>
                {lang === "fa" ? "🤖 AI Practitioner" : "🤖 Practical AI"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20 py-14">
        {/* ============ STATS ============ */}
        <Stats lang={lang} items={[
          { value: Math.max(counts.users, 120), label: d.home.statsLearners },
          { value: counts.articles, label: d.home.statsTutorials },
          { value: counts.courses, label: d.home.statsCourses },
          { value: counts.tools, label: d.home.statsTools },
        ]} />

        {/* ============ LEARN HUB ============ */}
        <section aria-label={d.home.learnTitle}>
          <SectionHeading title={d.home.learnTitle} sub={d.home.learnSub} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cats.map((c) => (
              <CategoryCard key={c.slug} lang={lang} category={c} count={c.count} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${lang}/learn`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-navy-900 text-navy-900 font-extrabold hover:bg-navy-900 hover:text-white transition">
              {d.home.viewAll}
            </Link>
          </div>
        </section>

        {/* ============ COURSES ============ */}
        <section aria-label={d.home.featuredCourses}>
          <SectionHeading title={d.home.featuredCourses} sub={d.home.featuredCoursesSub} />
          <div className="grid md:grid-cols-3 gap-5">
            {courses.map((c) => (
              <CourseCard key={c.slug} lang={lang} course={c} lessonCount={c.lessonCount} minutes={c.minutes} />
            ))}
          </div>
        </section>

        {/* ============ LATEST TUTORIALS + ARTICLES ============ */}
        <section aria-label={d.home.latestArticles}>
          <SectionHeading title={d.home.latestArticles} sub={d.home.latestArticlesSub} />
          <div className="grid md:grid-cols-3 gap-5">
            {[...latestTutorials, ...latestArticles].slice(0, 6).map((a) => (
              <ArticleCard key={a.slug} lang={lang} article={a} base={a.kind === "tutorial" ? "learn" : "blog"} bookmarked={bookmarked.has(a.id)} />
            ))}
          </div>
        </section>

        {/* ============ TOOLS ============ */}
        <section aria-label={d.home.toolsTitle}>
          <SectionHeading title={d.home.toolsTitle} sub={d.home.toolsSub} />
          <div className="grid md:grid-cols-3 gap-5">
            {tools.map((t) => (
              <ToolCard key={t.slug} lang={lang} tool={t} bookmarked={bookmarked.has(t.id)} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${lang}/tools`} className="text-tech-600 font-extrabold hover:text-tech-500 transition">{d.home.viewAll} ←</Link>
          </div>
        </section>

        {/* ============ PROJECTS ============ */}
        <section aria-label={d.home.projectsTitle}>
          <SectionHeading title={d.home.projectsTitle} sub={d.home.projectsSub} />
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.slug} lang={lang} project={p} />
            ))}
          </div>
        </section>

        {/* ============ JOURNEY PREVIEW ============ */}
        {journey.length > 0 && (
          <section aria-label={d.home.journeyTitle}>
            <SectionHeading title={d.home.journeyTitle} sub={d.home.journeySub} />
            <div className="grid md:grid-cols-3 gap-5">
              {journey.map((j) => (
                <Link key={j.id} href={`/${lang}/journey`} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <p className="text-xs font-bold text-tech-600">{fmtDate(j.date, lang)}</p>
                  <h3 className="mt-1 font-extrabold text-navy-900 leading-7">{pick(j, "title", lang)}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-6 line-clamp-2">{pick(j, "body", lang)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ============ INSTAGRAM ============ */}
        <InstagramSection lang={lang} />

        {/* ============ NEWSLETTER ============ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-tech-600 via-blue-700 to-navy-900 text-white p-8 sm:p-12">
          <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{d.home.newsletterTitle}</h2>
            <p className="mt-2 text-blue-100">{d.home.newsletterSub}</p>
            <div className="mt-6">
              <NewsletterForm lang={lang} placeholder={d.home.newsletterPlaceholder} button={d.home.newsletterButton} done={d.home.newsletterDone} />
            </div>
            <p className="mt-3 text-xs text-blue-200">PorAI · {lang === "fa" ? settings.site_name_fa : settings.site_name_en}</p>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <CTAWork lang={lang} />
      </div>
    </>
  );
}
