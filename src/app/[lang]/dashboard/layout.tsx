import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getCurrentUser } from "@/lib/session";
import { Notifs } from "@/lib/db";
import { signOut } from "./actions";

export default async function DashboardLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/auth/login`);
  const unread = Notifs.unreadCount(user.id);

  const links = [
    { href: `/${lang}/dashboard`, label: d.dashboard.overview, icon: "📊" },
    { href: `/${lang}/dashboard/courses`, label: d.dashboard.myCourses, icon: "🎓" },
    { href: `/${lang}/dashboard/saved`, label: d.dashboard.saved, icon: "🔖" },
    { href: `/${lang}/dashboard/history`, label: d.dashboard.history, icon: "🕘" },
    { href: `/${lang}/dashboard/settings`, label: d.dashboard.settings, icon: "⚙️" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-tech-500 to-navy-900 text-white text-2xl font-extrabold shadow-lg">
          {(user.name || user.phone).slice(0, 1)}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">
            {d.dashboard.welcome}، {user.name || user.phone}
          </h1>
          <p className="text-sm text-slate-500" dir="ltr">{user.phone}</p>
        </div>
        {unread > 0 && (
          <span className="ms-auto text-xs font-extrabold px-3 py-1.5 rounded-full bg-rose-100 text-rose-600">
            {unread} {d.dashboard.notifications}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-6 items-start">
        <aside className="bg-white rounded-2xl border border-slate-200/80 p-3 lg:sticky lg:top-24">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="dashboard">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-navy-900 transition whitespace-nowrap">
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}
            <form action={signOut.bind(null, lang)} className="lg:mt-2 lg:pt-2 lg:border-t lg:border-slate-100">
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition whitespace-nowrap">
                <span>🚪</span>{d.nav.logout}
              </button>
            </form>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
