import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Cats, Articles, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { ArticleCard } from "@/components/cards";
import { cx } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.nav.blog,
    alternates: { canonical: absoluteUrl(`/${l}/blog`), languages: { fa: absoluteUrl("/fa/blog"), en: absoluteUrl("/en/blog") } },
  };
}

export default async function BlogIndex({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { lang: raw } = await params;
  const { cat } = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();

  const cats = Cats.all("article");
  const active = cat ? Cats.bySlug(cat) : null;
  const posts = Articles.list({
    kind: "article", status: "published",
    ...(active ? { categoryId: active.id } : {}),
    limit: 60,
  });
  const bookmarked = user ? Bookmarks.idsByUser(user.id) : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900">{d.nav.blog}</h1>
      <p className="mt-2 text-slate-500">{d.home.latestArticlesSub}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/${lang}/blog`}
          className={cx("px-4 py-2 rounded-full text-sm font-bold transition", !active ? "bg-navy-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-navy-900")}>
          {d.common.all}
        </Link>
        {cats.map((c) => (
          <Link key={c.slug} href={`/${lang}/blog?cat=${c.slug}`}
            className={cx("px-4 py-2 rounded-full text-sm font-bold transition", active?.slug === c.slug ? "bg-navy-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-navy-900")}>
            {pick(c, "name", lang)}
          </Link>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {posts.map((a) => (
            <ArticleCard key={a.slug} lang={lang} article={a} base="blog" bookmarked={bookmarked.has(a.id)} />
          ))}
        </div>
      ) : (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
          {d.search.noResults}
        </div>
      )}
    </div>
  );
}
