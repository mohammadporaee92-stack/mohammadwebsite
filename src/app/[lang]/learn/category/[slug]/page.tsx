import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Cats, Articles, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { ArticleCard, CategoryGlyph } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const cat = Cats.bySlug(slug);
  if (!cat) return {};
  return {
    title: pick(cat, "name", l),
    description: pick(cat, "desc", l),
    alternates: { canonical: absoluteUrl(`/${l}/learn/category/${slug}`) },
  };
}

export default async function LearnCategory({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const cat = Cats.bySlug(slug);
  if (!cat || cat.kind !== "tutorial") notFound();

  const user = await getCurrentUser();
  const posts = Articles.list({ kind: "tutorial", status: "published", categoryId: cat.id, limit: 100 });
  const bookmarked = user ? Bookmarks.idsByUser(user.id) : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="breadcrumb">
        <Link href={`/${lang}`} className="hover:text-navy-900">{d.nav.home}</Link>
        <span>/</span>
        <Link href={`/${lang}/learn`} className="hover:text-navy-900">{d.nav.learn}</Link>
        <span>/</span>
        <span className="text-navy-900 font-bold">{pick(cat, "name", lang)}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <CategoryGlyph name={pick(cat, "name", lang)} className="w-16 h-16 text-2xl" />
        <div>
          <h1 className="text-3xl font-extrabold text-navy-900">{pick(cat, "name", lang)}</h1>
          {pick(cat, "desc", lang) && <p className="mt-1 text-slate-500">{pick(cat, "desc", lang)}</p>}
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {posts.map((a) => (
            <ArticleCard key={a.slug} lang={lang} article={a} base="learn" bookmarked={bookmarked.has(a.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          {d.search.noResults}
        </div>
      )}
    </div>
  );
}
