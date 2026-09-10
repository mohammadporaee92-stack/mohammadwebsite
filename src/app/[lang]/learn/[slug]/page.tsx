import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { Articles, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { recordHistory, bumpViews } from "@/lib/history";
import { excerptOf } from "@/lib/content";
import ArticleDetail from "@/components/article-view";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const a = Articles.bySlug(slug);
  if (!a || a.kind !== "tutorial") return {};
  const title = (l === "fa" ? a.metaTitleFa : a.metaTitleEn) || pick(a, "title", l);
  const desc = (l === "fa" ? a.metaDescFa : a.metaDescEn) || pick(a, "excerpt", l) || excerptOf(pick(a, "content", l));
  const url = absoluteUrl(`/${l}/learn/${slug}`);
  return {
    title, description: desc,
    alternates: { canonical: url, languages: { fa: absoluteUrl(`/fa/learn/${slug}`), en: absoluteUrl(`/en/learn/${slug}`) } },
    openGraph: { type: "article", title, description: desc, url, publishedTime: a.createdAt, modifiedTime: a.updatedAt, authors: ["Mohammad Pouraei"] },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function TutorialPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const article = Articles.bySlug(slug);
  if (!article || article.kind !== "tutorial" || article.status !== "published") notFound();

  const user = await getCurrentUser();
  await bumpViews(article.id);
  let bookmarked = false;
  if (user) {
    bookmarked = Bookmarks.idsByUser(user.id).has(article.id);
    await recordHistory({
      userId: user.id, targetType: "article", targetId: article.id,
      title: pick(article, "title", lang), url: `/${lang}/learn/${slug}`,
    });
  }

  return <ArticleDetail lang={lang} article={article} bookmarked={bookmarked} base="learn" />;
}
