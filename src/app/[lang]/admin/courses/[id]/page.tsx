import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtNum } from "@/lib/i18n";
import { Courses, Cats, Enroll } from "@/lib/db";
import {
  saveCourse, saveModule, deleteModule, moveModule,
  saveLesson, deleteLesson, moveLesson, addAttachment, deleteAttachment,
} from "../../actions";
import { UploadField } from "@/components/forms";

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-500";

export default async function AdminCourseEdit({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: raw, id } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const isNew = id === "new";
  const course = isNew ? null : Courses.byId(id);
  if (!isNew && !course) notFound();

  const cats = Cats.all("course");
  const modules = isNew ? [] : Courses.modules(id).map((m) => ({
    ...m,
    lessons: Courses.lessonsByModule(m.id).map((l) => ({ ...l, attachments: Courses.attachments(l.id) })),
  }));
  const enrollments = isNew ? [] : Enroll.listByCourse(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-navy-900">{isNew ? "New course" : pick(course!, "title", lang)}</h1>
        <Link href={`/${lang}/admin/courses`} className="text-sm font-bold text-slate-500">← Back</Link>
      </div>

      {/* course fields */}
      <form action={saveCourse} className="bg-white rounded-2xl border border-slate-200/80 p-5 grid md:grid-cols-2 gap-4">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="id" value={id} />
        <div><label className="block text-xs font-extrabold mb-1">Slug</label><input name="slug" defaultValue={course?.slug || ""} dir="ltr" className={inputCls} /></div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="block text-xs font-extrabold mb-1">Status</label>
            <select name="status" defaultValue={course?.status || "draft"} className={inputCls}>
              <option value="draft">draft</option><option value="published">published</option>
            </select></div>
          <div><label className="block text-xs font-extrabold mb-1">Price</label>
            <select name="priceType" defaultValue={course?.priceType || "free"} className={inputCls}>
              <option value="free">free</option><option value="paid">paid</option>
            </select></div>
          <div><label className="block text-xs font-extrabold mb-1">Level</label>
            <select name="level" defaultValue={course?.level || "beginner"} className={inputCls}>
              <option value="beginner">beginner</option><option value="intermediate">intermediate</option><option value="advanced">advanced</option>
            </select></div>
        </div>
        <div><label className="block text-xs font-extrabold mb-1">Title FA *</label><input name="titleFa" defaultValue={course?.titleFa || ""} required className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Title EN *</label><input name="titleEn" defaultValue={course?.titleEn || ""} required className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Desc FA</label><textarea name="descFa" rows={3} defaultValue={course?.descFa || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Desc EN</label><textarea name="descEn" rows={3} defaultValue={course?.descEn || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Outcomes FA (1 per line)</label><textarea name="outcomesFa" rows={4} defaultValue={course?.outcomesFa || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Outcomes EN</label><textarea name="outcomesEn" rows={4} defaultValue={course?.outcomesEn || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Audience FA</label><textarea name="audienceFa" rows={3} defaultValue={course?.audienceFa || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Audience EN</label><textarea name="audienceEn" rows={3} defaultValue={course?.audienceEn || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Prereq FA</label><textarea name="prereqFa" rows={2} defaultValue={course?.prereqFa || ""} className={inputCls} /></div>
        <div><label className="block text-xs font-extrabold mb-1">Prereq EN</label><textarea name="prereqEn" rows={2} defaultValue={course?.prereqEn || ""} className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-xs font-extrabold mb-1">Price IRT</label><input name="priceIrt" type="number" defaultValue={course?.priceIrt ?? ""} className={inputCls} /></div>
          <div><label className="block text-xs font-extrabold mb-1">Price USD</label><input name="priceUsd" type="number" defaultValue={course?.priceUsd ?? ""} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-xs font-extrabold mb-1">Category</label>
            <select name="categoryId" defaultValue={course?.categoryId || ""} className={inputCls}>
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
            </select></div>
          <div><label className="block text-xs font-extrabold mb-1">Instructor</label><input name="instructor" defaultValue={course?.instructor || "Mohammad Pouraei"} className={inputCls} /></div>
        </div>
        <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
          <UploadField name="coverUrl" label="Cover image" initial={course?.coverUrl || ""} />
          <div className="flex items-end">
            <p className="text-xs font-bold text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 w-full">
              📝 {lang === "fa" ? "دوره‌های این سایت متنی هستند؛ بدون ویدیو." : "Courses on this site are text-based; no video."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="featured" defaultChecked={course?.featured} className="w-4 h-4 accent-blue-600" /> Featured</label>
          <label className="flex items-center gap-2 text-sm font-bold">Course lang:
            <select name="courseLang" defaultValue={course?.lang || "both"} className="px-2 py-1 rounded-lg border border-slate-200 text-sm">
              <option value="both">both</option><option value="fa">fa</option><option value="en">en</option>
            </select>
          </label>
        </div>
        <div className="md:col-span-2">
          <button className="px-8 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold">Save course</button>
        </div>
      </form>

      {!isNew && (
        <>
          {/* modules & lessons */}
          <section className="space-y-3">
            <h2 className="font-extrabold text-navy-900">Modules & Lessons</h2>
            {modules.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200/80 p-4">
                <div className="flex items-center gap-2">
                  <form action={saveModule} className="flex flex-1 flex-wrap items-center gap-2">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="courseId" value={id} />
                    <input type="hidden" name="id" value={m.id} />
                    <input name="titleFa" defaultValue={m.titleFa} className="flex-1 min-w-36 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm font-bold" />
                    <input name="titleEn" defaultValue={m.titleEn} className="flex-1 min-w-36 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm" />
                    <button className="text-xs font-extrabold text-tech-600">Save</button>
                  </form>
                  <form action={moveModule} className="flex gap-1">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="courseId" value={id} />
                    <input type="hidden" name="id" value={m.id} />
                    <button name="dir" value="up" className="text-xs px-1.5 py-1 rounded bg-slate-100">↑</button>
                    <button name="dir" value="down" className="text-xs px-1.5 py-1 rounded bg-slate-100">↓</button>
                  </form>
                  <form action={deleteModule}>
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="courseId" value={id} />
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-xs font-bold text-rose-500">✕</button>
                  </form>
                </div>

                <ul className="mt-3 space-y-2">
                  {m.lessons.map((l) => (
                    <li key={l.id} className="rounded-xl bg-slate-50 border border-slate-100">
                      <details>
                        <summary className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold cursor-pointer list-none">
                          <span className="flex-1 truncate">{pick(l, "title", lang)} <span className="text-[11px] text-slate-400 font-mono">· {l.durationMin}m {l.isFree ? "· FREE" : ""}</span></span>
                          <span className="text-tech-600 text-xs">Edit ▾</span>
                        </summary>
                        <div className="px-3 pb-3 space-y-2">
                          <form action={saveLesson} className="grid md:grid-cols-2 gap-2">
                            <input type="hidden" name="lang" value={lang} />
                            <input type="hidden" name="courseId" value={id} />
                            <input type="hidden" name="moduleId" value={m.id} />
                            <input type="hidden" name="id" value={l.id} />
                            <input name="titleFa" defaultValue={l.titleFa} placeholder="Title FA" className={inputCls} />
                            <input name="titleEn" defaultValue={l.titleEn} placeholder="Title EN" className={inputCls} />
                            <textarea name="bodyFa" rows={4} defaultValue={l.bodyFa} placeholder="Body FA" className={`${inputCls} font-mono`} />
                            <textarea name="bodyEn" rows={4} defaultValue={l.bodyEn} placeholder="Body EN" className={`${inputCls} font-mono`} />
                            <div className="flex items-center gap-3 md:col-span-2">
                              <label className="text-xs font-bold text-slate-500">⏱ {lang === "fa" ? "دقیقه مطالعه" : "Reading minutes"}</label>
                              <input name="durationMin" type="number" min={1} defaultValue={l.durationMin} className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                              <label className="flex items-center gap-1.5 text-xs font-bold"><input type="checkbox" name="isFree" defaultChecked={l.isFree} className="accent-blue-600" /> Free preview</label>
                              <button className="ms-auto text-xs font-extrabold px-3 py-1.5 rounded-lg bg-navy-900 text-white">Save</button>
                            </div>
                          </form>
                          {/* attachments */}
                          <div className="rounded-lg bg-white border border-slate-100 p-2.5">
                            <p className="text-[11px] font-extrabold text-slate-500 mb-1.5">Attachments</p>
                            <ul className="space-y-1 mb-2">
                              {l.attachments.map((a) => (
                                <li key={a.id} className="flex items-center gap-2 text-xs">
                                  <a href={a.url} target="_blank" rel="noopener" className="font-bold text-tech-600 truncate flex-1">📎 {a.title}</a>
                                  <form action={deleteAttachment}>
                                    <input type="hidden" name="lang" value={lang} />
                                    <input type="hidden" name="courseId" value={id} />
                                    <input type="hidden" name="id" value={a.id} />
                                    <button className="text-rose-500 font-bold">✕</button>
                                  </form>
                                </li>
                              ))}
                            </ul>
                            <form action={addAttachment} className="flex gap-1.5">
                              <input type="hidden" name="lang" value={lang} />
                              <input type="hidden" name="courseId" value={id} />
                              <input type="hidden" name="lessonId" value={l.id} />
                              <input name="title" placeholder="File title" required className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
                              <input name="url" placeholder="/uploads/..." required dir="ltr" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
                              <button className="text-xs font-extrabold px-2.5 py-1.5 rounded-lg bg-slate-100">+ Add</button>
                            </form>
                          </div>
                          <div className="flex gap-2">
                            <form action={moveLesson} className="flex gap-1">
                              <input type="hidden" name="lang" value={lang} />
                              <input type="hidden" name="courseId" value={id} />
                              <input type="hidden" name="moduleId" value={m.id} />
                              <input type="hidden" name="id" value={l.id} />
                              <button name="dir" value="up" className="text-xs px-2 py-1 rounded bg-slate-100">↑</button>
                              <button name="dir" value="down" className="text-xs px-2 py-1 rounded bg-slate-100">↓</button>
                            </form>
                            <form action={deleteLesson}>
                              <input type="hidden" name="lang" value={lang} />
                              <input type="hidden" name="courseId" value={id} />
                              <input type="hidden" name="id" value={l.id} />
                              <button className="text-xs font-bold text-rose-500">Delete lesson</button>
                            </form>
                          </div>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>

                {/* add lesson */}
                <form action={saveLesson} className="mt-2 flex flex-wrap gap-1.5">
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="courseId" value={id} />
                  <input type="hidden" name="moduleId" value={m.id} />
                  <input type="hidden" name="id" value="new" />
                  <input name="titleFa" placeholder="+ New lesson FA" required className="flex-1 min-w-32 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-sm" />
                  <input name="titleEn" placeholder="EN" required className="flex-1 min-w-32 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-sm" />
                  <button className="text-xs font-extrabold px-3 py-1.5 rounded-lg bg-blue-50 text-tech-600">+ Add</button>
                </form>
              </div>
            ))}

            {/* add module */}
            <form action={saveModule} className="flex flex-wrap gap-2 bg-white rounded-2xl border border-dashed border-slate-300 p-3">
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="courseId" value={id} />
              <input type="hidden" name="id" value="new" />
              <input name="titleFa" placeholder="+ New module FA" required className="flex-1 min-w-40 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <input name="titleEn" placeholder="EN" required className="flex-1 min-w-40 px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <button className="text-sm font-extrabold px-4 py-2 rounded-xl bg-navy-900 text-white">+ Add module</button>
            </form>
          </section>

          {/* enrollments */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <h2 className="font-extrabold text-navy-900 mb-2">Enrollments ({fmtNum(enrollments.length, lang)})</h2>
            {enrollments.length > 0 ? (
              <ul className="text-sm space-y-1 max-h-48 overflow-auto">
                {enrollments.map((e) => (
                  <li key={e.id as string} className="flex justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                    <span className="font-bold" dir="ltr">{(e.phone as string) || ""} {(e.name as string) ? `(${(e.name as string)})` : ""}</span>
                    <span className="text-xs text-slate-400">{String(e.createdAt).slice(0, 10)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No enrollments yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
