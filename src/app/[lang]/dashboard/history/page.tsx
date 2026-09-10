import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { History } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardHistory({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const items = History.listByUser(user.id, 50);

  return (
    <div>
      <h2 className="font-extrabold text-navy-900 text-lg mb-4">{d.dashboard.history}</h2>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h.id as string}>
              <Link href={(h.url as string).startsWith("/") ? (h.url as string) : `/${lang}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 px-4 py-3.5 hover:border-tech-500 hover:shadow-md transition">
                <span className="text-xl">🕘</span>
                <span className="font-bold text-navy-900 text-sm flex-1 truncate">{(h.title as string) || (h.url as string)}</span>
                <span className="text-[11px] text-slate-400 shrink-0">{fmtDate(h.createdAt as string, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 font-semibold">
          {d.dashboard.noHistory}
        </div>
      )}
    </div>
  );
}
