import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getCurrentUser, isStaff } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import Logo from "./Logo";
import { MobileMenu, LangSwitch, SearchButton } from "./forms";

export default async function Navbar({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const [user, instagram] = await Promise.all([
    getCurrentUser(),
    getSetting("instagram", "mohammad_por_ai"),
  ]);

  const links = [
    { href: `/${lang}`, label: d.nav.home },
    { href: `/${lang}/learn`, label: d.nav.learn },
    { href: `/${lang}/courses`, label: d.nav.courses },
    { href: `/${lang}/tools`, label: d.nav.tools },
    { href: `/${lang}/projects`, label: d.nav.projects },
    { href: `/${lang}/blog`, label: d.nav.blog },
    { href: `/${lang}/about`, label: d.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-950/95 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <Logo lang={lang} dark />

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium" aria-label="main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={`/${lang}/work`}
              className="ms-1 px-4 py-2 rounded-lg bg-gradient-to-r from-tech-500 to-blue-600 text-white font-bold shadow-md shadow-blue-900/40 hover:brightness-110 transition"
            >
              {d.nav.work}
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <SearchButton lang={lang} label={d.nav.search} />
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <LangSwitch lang={lang} />
            {user ? (
              <div className="flex items-center gap-2 ms-1">
                {isStaff(user.role) && (
                  <Link href={`/${lang}/admin`} className="px-3 py-2 rounded-lg text-xs font-bold text-amber-300 border border-amber-400/30 hover:bg-amber-400/10 transition">
                    {d.nav.admin}
                  </Link>
                )}
                <Link href={`/${lang}/dashboard`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-to-br from-sky-glow to-tech-500 text-white text-xs font-extrabold">
                    {(user.name || user.phone).slice(0, 1)}
                  </span>
                  <span className="text-sm text-white font-semibold max-w-24 truncate">
                    {user.name || d.nav.dashboard}
                  </span>
                </Link>
              </div>
            ) : (
              <Link href={`/${lang}/auth/login`} className="ms-1 px-4 py-2 rounded-lg border border-white/25 text-white text-sm font-bold hover:bg-white/10 transition">
                {d.nav.login}
              </Link>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <SearchButton lang={lang} label={d.nav.search} />
            <LangSwitch lang={lang} />
            <MobileMenu
              lang={lang}
              links={[...links, { href: `/${lang}/work`, label: d.nav.work }, { href: `/${lang}/journey`, label: d.nav.journey }, { href: `/${lang}/contact`, label: d.nav.contact }]}
              loginLabel={d.nav.login}
              dashboardLabel={d.nav.dashboard}
              adminLabel={d.nav.admin}
              logoutLabel={d.nav.logout}
              loggedIn={!!user}
              userName={user?.name || ""}
              isStaff={isStaff(user?.role)}
              instagram={instagram}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
