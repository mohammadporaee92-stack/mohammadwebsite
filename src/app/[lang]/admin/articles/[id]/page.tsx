import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { Articles, Cats, Tags } from "@/lib/db";
import { saveArticle } from "../../actions";
import { UploadField } from "@/components/forms";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-navy-900 mb-1">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-500";

export default async function AdminArticleEdit({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const isNew = id === "new";
  const article = isNew ? null : Articles.byId(id);
  if (!isNew && !article) notFound();

  const cats = Cats.all();
  const tags = Tags.all();
  const checked = isNew ? new Set<string>() : new Set(Tags.forArticle(id).map((t) => (t as { id: string }).id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy-900">{isNew ? (lang === "fa" ? "مطلب جدید" : "New post") : (lang === "fa" ? "ویرایش مطلب" : "Edit post")}</h1>
        <Link href={`/${lang}/admin/articles`} className="text-sm font-bold text-slate-500">← {lang === "fa" ? "بازگشت" : "Back"}</Link>
      </div>

      <form action={saveArticle} className="bg-white rounded-2xl border border-slate-200/80 p-5 grid md:grid-cols-2 gap-4">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="id" value={id} />

        <Field label="Slug"><input name="slug" defaultValue={article?.slug || ""} dir="ltr" className={inputCls} placeholder="auto from title if empty" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Kind">
            <select name="kind" defaultValue={article?.kind || "article"} className={inputCls}>
              <option value="article">article</option>
              <option value="tutorial">tutorial</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={article?.status || "draft"} className={inputCls}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="scheduled">scheduled</option>
            </select>
          </Field>
          <Field label="Difficulty">
            <select name="difficulty" defaultValue={article?.difficulty || ""} className={inputCls}>
              <option value="">—</option>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </Field>
        </div>

        <Field label="Category">
          <select name="categoryId" defaultValue={article?.categoryId || ""} className={inputCls}>
            <option value="">—</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>[{c.kind}] {c.nameEn} / {c.nameFa}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Read minutes"><input name="readMinutes" type="number" defaultValue={article?.readMinutes ?? 5} className={inputCls} /></Field>
          <Field label="Publish at"><input name="publishAt" type="datetime-local" defaultValue={article?.publishAt ? new Date(article.publishAt).toISOString().slice(0, 16) : ""} className={inputCls} /></Field>
        </div>

        <div className="md:col-span-2"><UploadField name="coverUrl" label="Cover image" initial={article?.coverUrl || ""} /></div>

        <Field label="Title (FA) *"><input name="titleFa" defaultValue={article?.titleFa || ""} required className={inputCls} /></Field>
        <Field label="Title (EN) *"><input name="titleEn" defaultValue={article?.titleEn || ""} required className={inputCls} /></Field>
        <Field label="Excerpt (FA)"><textarea name="excerptFa" rows={2} defaultValue={article?.excerptFa || ""} className={inputCls} /></Field>
        <Field label="Excerpt (EN)"><textarea name="excerptEn" rows={2} defaultValue={article?.excerptEn || ""} className={inputCls} /></Field>
        <Field label="Content (FA) — markdown-lite"><textarea name="contentFa" rows={12} defaultValue={article?.contentFa || ""} className={`${inputCls} font-mono`} dir="auto" /></Field>
        <Field label="Content (EN) — markdown-lite"><textarea name="contentEn" rows={12} defaultValue={article?.contentEn || ""} className={`${inputCls} font-mono`} dir="auto" /></Field>

        <Field label="Tags">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const tid = (t as { id: string }).id;
              return (
                <label key={tid} className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer">
                  <input type="checkbox" name="tagIds" value={tid} defaultChecked={checked.has(tid)} className="accent-blue-600" />
                  {(t as { nameEn: string }).nameEn}
                </label>
              );
            })}
          </div>
        </Field>
        <Field label="Author"><input name="authorName" defaultValue={article?.authorName || "Mohammad Poraee"} className={inputCls} /></Field>

        <div className="md:col-span-2 grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <Field label="SEO title (FA)"><input name="metaTitleFa" defaultValue={article?.metaTitleFa || ""} className={inputCls} /></Field>
          <Field label="SEO title (EN)"><input name="metaTitleEn" defaultValue={article?.metaTitleEn || ""} className={inputCls} /></Field>
          <Field label="SEO desc (FA)"><textarea name="metaDescFa" rows={2} defaultValue={article?.metaDescFa || ""} className={inputCls} /></Field>
          <Field label="SEO desc (EN)"><textarea name="metaDescEn" rows={2} defaultValue={article?.metaDescEn || ""} className={inputCls} /></Field>
        </div>

        <div className="md:col-span-2">
          <button className="px-8 py-3 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
            {lang === "fa" ? "ذخیره" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
