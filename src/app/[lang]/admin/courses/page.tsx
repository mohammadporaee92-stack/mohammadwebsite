import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtNum } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Courses } from "@/lib/db";
import { deleteCourse } from "../actions";
import { cx } from "@/lib/utils";

export default async function AdminCourses({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const list = Courses.list({ limit: 100 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-navy-900">{d.admin.courses} ({fmtNum(list.length, lang)})</h1>
        <Link href={`/${lang}/admin/courses/new`} className="px-4 py-2 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
          + {lang === "fa" ? "جدید" : "New"}
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-navy-900 truncate">{pick(c, "title", lang)}</p>
                <p className="text-[11px] text-slate-400 font-mono" dir="ltr">/{c.slug} · {c.lessonCount} lessons · {c.minutes} min · {c.priceType}</p>
              </div>
              <span className={cx("text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0",
                c.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                {c.status}
              </span>
              <Link href={`/${lang}/admin/courses/${c.id}`} className="text-xs font-extrabold text-tech-600 shrink-0">
                {lang === "fa" ? "ویرایش" : "Edit"}
              </Link>
              <form action={deleteCourse}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs font-bold text-rose-500">✕</button>
              </form>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-400">{d.search.noResults}</p>}
      </div>
    </div>
  );
}
