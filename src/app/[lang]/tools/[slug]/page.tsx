import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Tools, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { recordHistory } from "@/lib/history";
import { splitLines } from "@/lib/content";
import { CategoryGlyph, ToolCard } from "@/components/cards";
import { BookmarkButton } from "@/components/forms";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const t = Tools.bySlug(slug);
  if (!t) return {};
  const desc = pick(t, "desc", l);
  return {
    title: t.name, description: desc,
    alternates: { canonical: absoluteUrl(`/${l}/tools/${slug}`) },
    openGraph: { title: t.name, description: desc, url: absoluteUrl(`/${l}/tools/${slug}`) },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const tool = Tools.bySlug(slug);
  if (!tool || tool.status !== "published") notFound();

  const user = await getCurrentUser();
  const bookmarked = user ? Bookmarks.idsByUser(user.id).has(tool.id) : false;
  const related = Tools.list({ status: "published", limit: 4 }).filter((t) => t.id !== tool.id).slice(0, 3);
  if (user) {
    await recordHistory({ userId: user.id, targetType: "tool", targetId: tool.id, title: tool.name, url: `/${lang}/tools/${slug}` });
  }

  const pricingLabel = tool.pricing === "free" ? d.home.free : tool.pricing === "paid" ? d.home.paid : lang === "fa" ? "فریمیوم" : "Freemium";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="breadcrumb">
        <Link href={`/${lang}`} className="hover:text-navy-900">{d.nav.home}</Link>
        <span>/</span>
        <Link href={`/${lang}/tools`} className="hover:text-navy-900">{d.nav.tools}</Link>
        <span>/</span>
        <span className="text-navy-900 font-bold" dir="ltr">{tool.name}</span>
      </nav>

      <article className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {tool.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tool.logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <CategoryGlyph name={tool.name} className="w-16 h-16 text-2xl" />
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-navy-900" dir="ltr">{tool.name}</h1>
              <p className="mt-1"><span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-tech-600">{pricingLabel}</span></p>
            </div>
          </div>
          <BookmarkButton targetType="tool" targetId={tool.id} initial={bookmarked} labels={{ save: d.common.save, saved: d.common.saved, login: d.common.loginNeeded }} />
        </div>

        <p className="mt-5 text-slate-600 leading-8">{pick(tool, "desc", lang)}</p>

        {splitLines(pick(tool, "useCases", lang)).length > 0 && (
          <section className="mt-7">
            <h2 className="font-extrabold text-navy-900 mb-3">{lang === "fa" ? "بهترین کاربردها" : "Best use cases"}</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {splitLines(pick(tool, "useCases", lang)).map((u) => (
                <li key={u} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-2.5">
                  <span className="text-tech-500 font-extrabold">✓</span>{u}
                </li>
              ))}
            </ul>
          </section>
        )}

        {pick(tool, "review", lang) && (
          <section className="mt-7 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
            <h2 className="relative font-extrabold mb-2">⭐ {lang === "fa" ? "نظر محمد" : "Mohammad's review"}</h2>
            <p className="relative text-slate-200 leading-8">{pick(tool, "review", lang)}</p>
          </section>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          {tool.website && (
            <a href={tool.website} target="_blank" rel="noopener" className="px-6 py-3 rounded-xl bg-navy-900 text-white font-extrabold hover:bg-navy-700 transition" dir="ltr">
              ↗ {tool.website.replace("https://", "").split("/")[0]}
            </a>
          )}
          <Link href={`/${lang}/learn`} className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:border-navy-900 hover:text-navy-900 transition">
            {d.hero.ctaExplore}
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold text-navy-900 mb-5">{lang === "fa" ? "ابزارهای مرتبط" : "Related tools"}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((t) => (
              <ToolCard key={t.slug} lang={lang} tool={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
