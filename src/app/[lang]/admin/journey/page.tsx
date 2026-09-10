import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Journey } from "@/lib/db";
import { saveJourney, deleteJourney } from "../actions";

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-500";

export default async function AdminJourney({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { lang: raw } = await params;
  const sp = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const list = Journey.all();
  const editing = sp.new ? { id: "new" } : sp.edit ? list.find((j) => j.id === sp.edit) : null;
  const g = (k: string) => (editing && k in editing ? String((editing as Record<string, unknown>)[k] || "") : "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy-900">{d.admin.journey} ({list.length})</h1>
        <Link href={`/${lang}/admin/journey?new=1`} className="px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold">
          + {lang === "fa" ? "جدید" : "New"}
        </Link>
      </div>

      {editing && (
        <form action={saveJourney} className="bg-white rounded-2xl border-2 border-tech-500/40 p-5 grid md:grid-cols-2 gap-3">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={editing.id} />
          <div><label className="block text-xs font-extrabold mb-1">Title FA *</label><input name="titleFa" defaultValue={g("titleFa")} required className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Title EN *</label><input name="titleEn" defaultValue={g("titleEn")} required className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Body FA</label><textarea name="bodyFa" rows={4} defaultValue={g("bodyFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Body EN</label><textarea name="bodyEn" rows={4} defaultValue={g("bodyEn")} className={inputCls} /></div>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <div><label className="block text-xs font-extrabold mb-1">Kind</label>
              <select name="kind" defaultValue={g("kind") || "learning"} className={inputCls}>
                <option value="learning">learning</option><option value="building">building</option>
                <option value="experiment">experiment</option><option value="milestone">milestone</option><option value="lesson">lesson</option>
              </select></div>
            <div><label className="block text-xs font-extrabold mb-1">Date</label><input name="date" type="date" defaultValue={g("date") ? g("date").slice(0, 10) : ""} className={inputCls} /></div>
            <div><label className="block text-xs font-extrabold mb-1">Status</label>
              <select name="status" defaultValue={g("status") || "published"} className={inputCls}>
                <option value="published">published</option><option value="draft">draft</option>
              </select></div>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button className="px-6 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold">Save</button>
            <Link href={`/${lang}/admin/journey`} className="text-sm font-bold text-slate-400">Cancel</Link>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((j) => (
            <li key={j.id} className="flex items-center gap-3 px-4 py-3">
              <p className="flex-1 font-bold text-sm truncate">{pick(j, "title", lang)} <span className="text-[11px] text-slate-400">· {j.kind} · {j.date.slice(0, 10)}</span></p>
              <Link href={`/${lang}/admin/journey?edit=${j.id}`} className="text-xs font-extrabold text-tech-600">Edit</Link>
              <form action={deleteJourney}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={j.id} />
                <button className="text-xs font-bold text-rose-500">✕</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
