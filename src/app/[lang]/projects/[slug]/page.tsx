import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Projects } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { recordHistory } from "@/lib/history";
import { CTAWork, gradientFor } from "@/components/cards";
import { cx } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const p = Projects.bySlug(slug);
  if (!p) return {};
  return {
    title: pick(p, "title", l),
    description: pick(p, "summary", l),
    alternates: { canonical: absoluteUrl(`/${l}/projects/${slug}`) },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const project = Projects.bySlug(slug);
  if (!project || project.status !== "published") notFound();

  const user = await getCurrentUser();
  if (user) {
    await recordHistory({
      userId: user.id, targetType: "project", targetId: project.id,
      title: pick(project, "title", lang), url: `/${lang}/projects/${slug}`,
    });
  }

  const sections = [
    { icon: "🎯", title: lang === "fa" ? "مسئله" : "Problem", body: pick(project, "problem", lang) },
    { icon: "💡", title: lang === "fa" ? "راه‌حل" : "Solution", body: pick(project, "solution", lang) },
    { icon: "⚙️", title: lang === "fa" ? "فرایند" : "Process", body: pick(project, "process", lang) },
    { icon: "📈", title: lang === "fa" ? "نتیجه" : "Result", body: pick(project, "result", lang) },
    { icon: "📚", title: lang === "fa" ? "درس‌های آموخته" : "Lessons learned", body: pick(project, "lessons", lang) },
  ].filter((s) => s.body);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-10">
      <div>
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="breadcrumb">
          <Link href={`/${lang}`} className="hover:text-navy-900">{d.nav.home}</Link>
          <span>/</span>
          <Link href={`/${lang}/projects`} className="hover:text-navy-900">{d.nav.projects}</Link>
        </nav>
        <div className={cx("rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden bg-gradient-to-br", gradientFor(project.slug))}>
          <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
          <h1 className="relative text-3xl font-extrabold leading-snug">{pick(project, "title", lang)}</h1>
          <p className="relative mt-3 text-slate-200 leading-8">{pick(project, "summary", lang)}</p>
          {project.toolsUsed && (
            <p className="relative mt-4 flex flex-wrap gap-2" dir="ltr">
              {project.toolsUsed.split(",").map((t) => (
                <span key={t} className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20">{t.trim()}</span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((s) => (
          <section key={s.title} className="bg-white rounded-2xl border border-slate-200/80 p-6">
            <h2 className="font-extrabold text-navy-900 text-lg">{s.icon} {s.title}</h2>
            <p className="mt-2 text-slate-600 leading-8 whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>

      <CTAWork lang={lang} />
    </div>
  );
}
