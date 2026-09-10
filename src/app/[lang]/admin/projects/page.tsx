import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Projects } from "@/lib/db";
import { saveProject, deleteProject } from "../actions";
import { UploadField } from "@/components/forms";

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-500";

export default async function AdminProjects({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const { lang: raw } = await params;
  const sp = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const list = Projects.list({ limit: 100 });
  const editing = sp.new ? { id: "new" } : sp.edit ? Projects.byId(sp.edit) : null;
  const g = (k: string) => (editing && k in editing ? String((editing as Record<string, unknown>)[k] || "") : "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy-900">{d.admin.projects} ({list.length})</h1>
        <Link href={`/${lang}/admin/projects?new=1`} className="px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold">
          + {lang === "fa" ? "جدید" : "New"}
        </Link>
      </div>

      {editing && (
        <form action={saveProject} className="bg-white rounded-2xl border-2 border-tech-500/40 p-5 grid md:grid-cols-2 gap-3">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="id" value={editing.id} />
          {g("slug") && <input type="hidden" name="slug" value={g("slug")} />}
          <div><label className="block text-xs font-extrabold mb-1">Title FA *</label><input name="titleFa" defaultValue={g("titleFa")} required className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Title EN *</label><input name="titleEn" defaultValue={g("titleEn")} required className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Summary FA</label><textarea name="summaryFa" rows={2} defaultValue={g("summaryFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Summary EN</label><textarea name="summaryEn" rows={2} defaultValue={g("summaryEn")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Problem FA</label><textarea name="problemFa" rows={3} defaultValue={g("problemFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Problem EN</label><textarea name="problemEn" rows={3} defaultValue={g("problemEn")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Solution FA</label><textarea name="solutionFa" rows={3} defaultValue={g("solutionFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Solution EN</label><textarea name="solutionEn" rows={3} defaultValue={g("solutionEn")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Process FA</label><textarea name="processFa" rows={3} defaultValue={g("processFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Process EN</label><textarea name="processEn" rows={3} defaultValue={g("processEn")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Result FA</label><textarea name="resultFa" rows={2} defaultValue={g("resultFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Result EN</label><textarea name="resultEn" rows={2} defaultValue={g("resultEn")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Lessons FA</label><textarea name="lessonsFa" rows={2} defaultValue={g("lessonsFa")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Lessons EN</label><textarea name="lessonsEn" rows={2} defaultValue={g("lessonsEn")} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Tools used (comma)</label><input name="toolsUsed" defaultValue={g("toolsUsed")} dir="ltr" className={inputCls} /></div>
          <div className="flex items-end gap-3">
            <label className="block text-xs font-extrabold">Status
              <select name="status" defaultValue={g("status") || "published"} className={`${inputCls} mt-1`}>
                <option value="published">published</option><option value="draft">draft</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-bold pb-2"><input type="checkbox" name="featured" defaultChecked={!!(editing && "featured" in editing && editing.featured)} className="w-4 h-4 accent-blue-600" /> Featured</label>
          </div>
          <div className="md:col-span-2"><UploadField name="coverUrl" label="Cover" initial={g("coverUrl")} /></div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button className="px-6 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold">Save</button>
            <Link href={`/${lang}/admin/projects`} className="text-sm font-bold text-slate-400">Cancel</Link>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <p className="flex-1 font-bold text-sm truncate">{pick(p, "title", lang)}</p>
              <Link href={`/${lang}/admin/projects?edit=${p.id}`} className="text-xs font-extrabold text-tech-600">Edit</Link>
              <form action={deleteProject}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={p.id} />
                <button className="text-xs font-bold text-rose-500">✕</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
