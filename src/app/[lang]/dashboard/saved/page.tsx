import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang, pick, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Bookmarks, Articles, Courses, Tools, Projects } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardSaved({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const items = Bookmarks.listByUser(user.id).map((bm) => {
    const type = bm.targetType as string;
    const id = bm.targetId as string;
    if (type === "article") {
      const a = Articles.byId(id);
      if (!a) return null;
      return { id: bm.id as string, title: pick(a, "title", lang), url: `/${lang}/${a.kind === "tutorial" ? "learn" : "blog"}/${a.slug}`, date: bm.createdAt as string, icon: "📄" };
    }
    if (type === "course") {
      const c = Courses.byId(id);
      if (!c) return null;
      return { id: bm.id as string, title: pick(c, "title", lang), url: `/${lang}/courses/${c.slug}`, date: bm.createdAt as string, icon: "🎓" };
    }
    if (type === "tool") {
      const t = Tools.byId(id);
      if (!t) return null;
      return { id: bm.id as string, title: t.name, url: `/${lang}/tools/${t.slug}`, date: bm.createdAt as string, icon: "🧰" };
    }
    if (type === "project") {
      const p = Projects.byId(id);
      if (!p) return null;
      return { id: bm.id as string, title: pick(p, "title", lang), url: `/${lang}/projects/${p.slug}`, date: bm.createdAt as string, icon: "🚀" };
    }
    return null;
  }).filter(Boolean) as Array<{ id: string; title: string; url: string; date: string; icon: string }>;

  return (
    <div>
      <h2 className="font-extrabold text-navy-900 text-lg mb-4">{d.dashboard.saved}</h2>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id}>
              <Link href={it.url} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5 hover:border-tech-500 hover:shadow-md transition">
                <span className="text-xl">{it.icon}</span>
                <span className="font-bold text-navy-900 text-sm flex-1 truncate">{it.title}</span>
                <span className="text-[11px] text-slate-400 shrink-0">{fmtDate(it.date, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 font-semibold">
          {d.dashboard.noSaved}
        </div>
      )}
    </div>
  );
}
