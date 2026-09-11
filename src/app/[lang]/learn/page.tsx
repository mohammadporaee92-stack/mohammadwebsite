import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Cats, Articles, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { SectionHeading, CategoryCard, ArticleCard } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.home.learnTitle,
    description: d.home.learnSub,
    alternates: { canonical: absoluteUrl(`/${l}/learn`), languages: { fa: absoluteUrl("/fa/learn"), en: absoluteUrl("/en/learn") } },
  };
}

export default async function LearnHub({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();

  const cats = Cats.withArticleCounts("tutorial");
  const latest = Articles.list({ kind: "tutorial", status: "published", limit: 9 });
  const bookmarked = user ? Bookmarks.idsByUser(user.id) : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white p-8 sm:p-12">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{d.home.learnTitle}</h1>
          <p className="mt-3 text-slate-300 leading-7">{d.home.learnSub}</p>
          <Link href={"/" + lang + "/courses/ai-from-zero"} className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-extrabold text-navy-900">{lang === "fa" ? "شروع دوره متنی رایگان" : "Start the free text course"}</Link>
          <p className="mt-4 block text-sm font-bold text-sky-glow border-s-2 border-sky-glow ps-3">{d.hero.philosophy}</p>
        </div>
      </section>

      <section aria-label="categories">
        <SectionHeading title={lang === "fa" ? "مسیرهای یادگیری" : "Learning paths"} align="start" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <CategoryCard key={c.slug} lang={lang} category={c} count={c.count} />
          ))}
        </div>
      </section>

      <section id="tutorials" className="scroll-mt-24" aria-label="latest">
        <SectionHeading title={d.home.latestArticles} align="start" />
        <div className="grid md:grid-cols-3 gap-5">
          {latest.map((a) => (
            <ArticleCard key={a.slug} lang={lang} article={a} base="learn" bookmarked={bookmarked.has(a.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
