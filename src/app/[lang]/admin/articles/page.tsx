import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtNum } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Articles } from "@/lib/db";
import { deleteArticle } from "../actions";
import { cx } from "@/lib/utils";

export default async function AdminArticles({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ kind?: string; status?: string; q?: string }>;
}) {
  const { lang: raw } = await params;
  const sp = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const list = Articles.list({
    ...(sp.kind ? { kind: sp.kind } : {}),
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.q ? { search: sp.q } : {}),
    limit: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-navy-900">{d.admin.articles} ({fmtNum(list.length, lang)})</h1>
        <Link href={`/${lang}/admin/articles/new`} className="px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
          + {lang === "fa" ? "جدید" : "New"}
        </Link>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={sp.q || ""} placeholder={d.search.placeholder}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white" />
        <select name="kind" defaultValue={sp.kind || ""} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">{d.common.all}</option>
          <option value="tutorial">{d.nav.learn}</option>
          <option value="article">{d.nav.blog}</option>
        </select>
        <select name="status" defaultValue={sp.status || ""} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">{d.common.all}</option>
          <option value="published">published</option>
          <option value="draft">draft</option>
          <option value="scheduled">scheduled</option>
        </select>
        <button className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-bold hover:bg-slate-200 transition">{d.search.button}</button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-navy-900 truncate">{pick(a, "title", lang)}</p>
                <p className="text-[11px] text-slate-400 font-mono" dir="ltr">/{a.slug} · {fmtNum(a.views, lang)} views</p>
              </div>
              <span className={cx("text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0",
                a.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                {a.status}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-tech-600 shrink-0">{a.kind}</span>
              <Link href={`/${lang}/admin/articles/${a.id}`} className="text-xs font-extrabold text-tech-600 hover:text-tech-500 shrink-0">
                {lang === "fa" ? "ویرایش" : "Edit"}
              </Link>
              <form action={deleteArticle}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={a.id} />
                <button className="text-xs font-bold text-rose-500 hover:text-rose-600">✕</button>
              </form>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-400">{d.search.noResults}</p>}
      </div>
    </div>
  );
}
