import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Cats, Tools, Bookmarks } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { SectionHeading, ToolCard } from "@/components/cards";
import { cx } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.nav.tools,
    description: d.home.toolsSub,
    alternates: { canonical: absoluteUrl(`/${l}/tools`) },
  };
}

export default async function ToolsIndex({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { lang: raw } = await params;
  const { cat } = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();

  const cats = Cats.all("tool");
  const active = cat ? Cats.bySlug(cat) : null;
  const tools = Tools.list({ status: "published", ...(active ? { categoryId: active.id } : {}), limit: 100 });
  const bookmarked = user ? Bookmarks.idsByUser(user.id) : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <SectionHeading title={d.nav.tools} sub={d.home.toolsSub} />
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Link href={`/${lang}/tools`}
          className={cx("px-4 py-2 rounded-full text-sm font-bold transition", !active ? "bg-navy-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-navy-900")}>
          {d.common.all}
        </Link>
        {cats.map((c) => (
          <Link key={c.slug} href={`/${lang}/tools?cat=${c.slug}`}
            className={cx("px-4 py-2 rounded-full text-sm font-bold transition", active?.slug === c.slug ? "bg-navy-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-navy-900")}>
            {pick(c, "name", lang)}
          </Link>
        ))}
      </div>
      {tools.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {tools.map((t) => (
            <ToolCard key={t.slug} lang={lang} tool={t} bookmarked={bookmarked.has(t.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">{d.search.noResults}</div>
      )}
    </div>
  );
}
