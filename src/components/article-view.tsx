import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { pick, fmtNum, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Articles, Cats, Tags, type Article } from "@/lib/db";
import { renderRich } from "@/lib/content";
import { absoluteUrl } from "@/lib/utils";
import JsonLd from "./JsonLd";
import { ArticleCard, gradientFor } from "./cards";
import { BookmarkButton } from "./forms";
import { cx } from "@/lib/utils";

export default function ArticleDetail({ lang, article, bookmarked, base }: {
  lang: Lang; article: Article; bookmarked: boolean; base: "learn" | "blog";
}) {
  const d = getDict(lang);
  const category = article.categoryId ? Cats.byId(article.categoryId) : null;
  const tags = Tags.forArticle(article.id);
  const related = Articles.list({
    kind: article.kind, status: "published",
    ...(article.categoryId ? { categoryId: article.categoryId } : {}),
    limit: 4,
  }).filter((a) => a.id !== article.id).slice(0, 3);

  const title = pick(article, "title", lang);
  const url = absoluteUrl(`/${lang}/${base}/${article.slug}`);
  const diff = article.difficulty === "beginner" ? d.common.beginner : article.difficulty === "advanced" ? d.common.advanced : d.common.intermediate;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: pick(article, "excerpt", lang),
    author: { "@type": "Person", name: "Mohammad Pouraei", url: absoluteUrl(`/${lang}/about`) },
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    inLanguage: lang === "fa" ? "fa" : "en",
  };

  return (
    <>
      <JsonLd data={schema} />
      {/* hero */}
      <section className={cx("relative overflow-hidden text-white", article.coverUrl ? "bg-navy-950" : `bg-gradient-to-br ${gradientFor(article.slug)}`)}>
        {article.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-18">
          <nav className="flex items-center gap-2 text-sm text-slate-300" aria-label="breadcrumb">
            <Link href={`/${lang}`} className="hover:text-white">{d.nav.home}</Link>
            <span>/</span>
            <Link href={`/${lang}/${base}`} className="hover:text-white">{base === "learn" ? d.nav.learn : d.nav.blog}</Link>
            {category && (
              <>
                <span>/</span>
                <span className="text-sky-glow">{pick(category, "name", lang)}</span>
              </>
            )}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">{base === "learn" ? d.nav.learn : d.nav.blog}</span>
            {article.difficulty && <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">{diff}</span>}
            <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20">{fmtNum(article.readMinutes, lang)} {d.common.minRead}</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-[1.5]">{title}</h1>
          {pick(article, "excerpt", lang) && (
            <p className="mt-3 text-lg text-slate-200 leading-8">{pick(article, "excerpt", lang)}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-sky-glow to-tech-500 font-extrabold">M</span>
              <div>
                <p className="font-bold">{article.authorName}</p>
                <p className="text-xs text-slate-300">{d.common.publishedAt} {fmtDate(article.createdAt, lang)} · {fmtNum(article.views, lang)} 👁</p>
              </div>
            </div>
            <div className="bg-white rounded-xl">
              <BookmarkButton targetType="article" targetId={article.id} initial={bookmarked} labels={{ save: d.common.save, saved: d.common.saved, login: d.common.loginNeeded }} />
            </div>
          </div>
        </div>
      </section>

      {/* body */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <article className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: renderRich(pick(article, "content", lang)) }} />
          {tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm font-extrabold text-navy-900 mb-3">{d.common.tags}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={(t as { id: string }).id} className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-tech-600">
                    #{pick(t as unknown as Record<string, unknown>, "name", lang)}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-navy-900 me-2">{d.common.share}:</span>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener" className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-navy-900 hover:text-white transition">Telegram</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener" className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-navy-900 hover:text-white transition">LinkedIn</a>
            <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener" className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-navy-900 hover:text-white transition">X</a>
          </div>
        </article>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-12" aria-label="related">
            <h2 className="text-xl font-extrabold text-navy-900 mb-5">{lang === "fa" ? "مطالب مرتبط" : "Related"}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a) => (
                <ArticleCard key={a.slug} lang={lang} article={a} base={base} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 text-center">
          <Link href={`/${lang}/${base}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-navy-900 text-navy-900 font-extrabold hover:bg-navy-900 hover:text-white transition">
            {d.common.back}
          </Link>
        </div>
      </div>
    </>
  );
}
