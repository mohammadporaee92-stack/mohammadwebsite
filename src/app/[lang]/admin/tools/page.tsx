import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Tools, Cats } from "@/lib/db";
import { saveTool, deleteTool } from "../actions";
import { UploadField } from "@/components/forms";

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-500";

export default async function AdminTools({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { lang: raw } = await params;
  const sp = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const list = Tools.list({ limit: 100 });
  const cats = Cats.all("tool");
  const editing = sp.new ? { id: "new" } : sp.edit ? Tools.byId(sp.edit) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy-900">{d.admin.tools} ({list.length})</h1>
        <Link href={`/${lang}/admin/tools?new=1`} className="px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold">
          + {lang === "fa" ? "جدید" : "New"}
        </Link>
      </div>

      {editing && (
        <form action={saveTool} className="bg-white rounded-2xl border-2 border-tech-500/40 p-5 grid md:grid-cols-2 gap-3">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={editing.id} />
          {"slug" in editing && <input type="hidden" name="slug" value={(editing as { slug: string }).slug} />}
          <div><label className="block text-xs font-extrabold mb-1">Name *</label><input name="name" defaultValue={"name" in editing ? (editing.name as string) : ""} required dir="ltr" className={inputCls} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="block text-xs font-extrabold mb-1">Pricing</label>
              <select name="pricing" defaultValue={"pricing" in editing ? (editing.pricing as string) : "freemium"} className={inputCls}>
                <option value="free">free</option><option value="freemium">freemium</option><option value="paid">paid</option>
              </select></div>
            <div><label className="block text-xs font-extrabold mb-1">Status</label>
              <select name="status" defaultValue={"status" in editing ? (editing.status as string) : "published"} className={inputCls}>
                <option value="published">published</option><option value="draft">draft</option>
              </select></div>
            <div><label className="block text-xs font-extrabold mb-1">Order</label><input name="sortOrder" type="number" defaultValue={"sortOrder" in editing ? (editing.sortOrder as number) : 0} className={inputCls} /></div>
          </div>
          <div><label className="block text-xs font-extrabold mb-1">Website</label><input name="website" defaultValue={"website" in editing ? ((editing.website as string) || "") : ""} dir="ltr" className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Category</label>
            <select name="categoryId" defaultValue={"categoryId" in editing ? ((editing.categoryId as string) || "") : ""} className={inputCls}>
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select></div>
          <div className="md:col-span-2"><UploadField name="logoUrl" label="Logo" initial={"logoUrl" in editing ? ((editing.logoUrl as string) || "") : ""} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Desc FA</label><textarea name="descFa" rows={3} defaultValue={"descFa" in editing ? (editing.descFa as string) : ""} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Desc EN</label><textarea name="descEn" rows={3} defaultValue={"descEn" in editing ? (editing.descEn as string) : ""} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Use cases FA (1/line)</label><textarea name="useCasesFa" rows={3} defaultValue={"useCasesFa" in editing ? (editing.useCasesFa as string) : ""} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Use cases EN</label><textarea name="useCasesEn" rows={3} defaultValue={"useCasesEn" in editing ? (editing.useCasesEn as string) : ""} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Review FA</label><textarea name="reviewFa" rows={3} defaultValue={"reviewFa" in editing ? (editing.reviewFa as string) : ""} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Review EN</label><textarea name="reviewEn" rows={3} defaultValue={"reviewEn" in editing ? (editing.reviewEn as string) : ""} className={inputCls} /></div>
          <div className="md:col-span-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="featured" defaultChecked={"featured" in editing ? !!(editing.featured) : false} className="w-4 h-4 accent-blue-600" /> Featured</label>
            <button className="px-6 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold">Save</button>
            <Link href={`/${lang}/admin/tools`} className="text-sm font-bold text-slate-400">Cancel</Link>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <p className="flex-1 font-bold text-sm truncate" dir="ltr">{t.name} <span className="text-[11px] text-slate-400 font-mono">/{t.slug}</span></p>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-tech-600">{t.pricing}</span>
              <Link href={`/${lang}/admin/tools?edit=${t.id}`} className="text-xs font-extrabold text-tech-600">Edit</Link>
              <form action={deleteTool}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={t.id} />
                <button className="text-xs font-bold text-rose-500">✕</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
