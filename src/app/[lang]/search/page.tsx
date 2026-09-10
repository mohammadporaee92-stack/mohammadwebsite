import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Articles, Courses, Tools, Projects } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";
import { ArticleCard, CourseCard, ToolCard, ProjectCard } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return { title: d.search.title, alternates: { canonical: absoluteUrl(`/${l}/search`) } };
}

export default async function SearchPage({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang: raw } = await params;
  const { q } = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const query = (q || "").trim();

  const articles = query ? Articles.list({ status: "published", search: query, limit: 12 }) : [];
  const courses = query ? Courses.list({ status: "published", search: query, limit: 6 }) : [];
  const tools = query ? Tools.list({ status: "published", search: query, limit: 6 }) : [];
  const projects = query
    ? Projects.list({ status: "published", limit: 50 }).filter((p) =>
        `${p.titleFa} ${p.titleEn} ${p.summaryFa} ${p.summaryEn}`.toLowerCase().includes(query.toLowerCase()))
    : [];
  const hasAny = articles.length + courses.length + tools.length + projects.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold text-navy-900">{d.search.title}</h1>
      <form action={`/${lang}/search`} method="get" className="mt-5 flex gap-2 max-w-2xl">
        <label htmlFor="q" className="sr-only">{d.search.placeholder}</label>
        <input id="q" name="q" defaultValue={query} placeholder={d.search.placeholder}
          className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-tech-500 shadow-sm" />
        <button className="px-6 py-3.5 rounded-xl bg-navy-900 text-white font-extrabold hover:bg-navy-700 transition">
          {d.search.button}
        </button>
      </form>

      {query && !hasAny && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          {d.search.noResults} «{query}»
        </div>
      )}

      {articles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-navy-900 mb-4">{d.search.articles}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {articles.map((a) => (
              <ArticleCard key={a.slug} lang={lang} article={a} base={a.kind === "tutorial" ? "learn" : "blog"} />
            ))}
          </div>
        </section>
      )}
      {courses.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-navy-900 mb-4">{d.search.courses}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {courses.map((c) => (
              <CourseCard key={c.slug} lang={lang} course={c} lessonCount={c.lessonCount} />
            ))}
          </div>
        </section>
      )}
      {tools.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-navy-900 mb-4">{d.search.tools}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {tools.map((t) => (
              <ToolCard key={t.slug} lang={lang} tool={t} />
            ))}
          </div>
        </section>
      )}
      {projects.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-navy-900 mb-4">{d.search.projects}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.slug} lang={lang} project={p} />
            ))}
          </div>
        </section>
      )}

      {!query && (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[d.nav.learn, d.nav.courses, d.nav.tools, d.nav.blog].map((t, i) => (
            <Link key={t} href={[`/${lang}/learn`, `/${lang}/courses`, `/${lang}/tools`, `/${lang}/blog`][i]}
              className="bg-white rounded-2xl border border-slate-200 p-5 font-extrabold text-navy-900 hover:border-tech-500 hover:shadow-lg transition text-center">
              {t}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
