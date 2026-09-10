import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getCurrentUser, isStaff, canManageUsers, canManageSettings } from "@/lib/session";

export async function generateMetadata() {
  return { robots: { index: false, follow: false } };
}

export default async function AdminLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const user = await getCurrentUser();
  // Hidden from public: only staff roles can enter. Others go to login.
  if (!user) redirect(`/${lang}/auth/login`);
  if (!isStaff(user.role)) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-5xl">⛔</p>
        <h1 className="mt-4 text-2xl font-extrabold text-navy-900">403</h1>
        <p className="mt-2 text-slate-500">{lang === "fa" ? "دسترسی غیرمجاز" : "Forbidden"}</p>
        <Link href={`/${lang}`} className="mt-4 inline-block text-tech-600 font-bold">{d.common.back}</Link>
      </div>
    );
  }

  const links = [
    { href: `/${lang}/admin`, label: d.admin.overview, icon: "📊", show: true },
    { href: `/${lang}/admin/articles`, label: d.admin.articles, icon: "📝", show: true },
    { href: `/${lang}/admin/courses`, label: d.admin.courses, icon: "🎓", show: true },
    { href: `/${lang}/admin/users`, label: d.admin.users, icon: "👥", show: canManageUsers(user.role) },
    { href: `/${lang}/admin/tools`, label: d.admin.tools, icon: "🧰", show: true },
    { href: `/${lang}/admin/projects`, label: d.admin.projects, icon: "🚀", show: true },
    { href: `/${lang}/admin/journey`, label: d.admin.journey, icon: "🛤️", show: true },
    { href: `/${lang}/admin/inquiries`, label: d.admin.inquiries, icon: "📥", show: true },
    { href: `/${lang}/admin/newsletter`, label: d.admin.newsletter, icon: "✉️", show: true },
    { href: `/${lang}/admin/settings`, label: d.admin.settings, icon: "⚙️", show: canManageSettings(user.role) },
  ].filter((l) => l.show);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-extrabold tracking-wide">
          {d.admin.title} · {user.role}
        </span>
        <Link href={`/${lang}`} className="text-sm font-bold text-tech-600 hover:text-tech-500">
          ← {d.admin.viewSite}
        </Link>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        <aside className="bg-navy-950 text-slate-200 rounded-2xl p-3 lg:sticky lg:top-24">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="admin">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 transition whitespace-nowrap">
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
