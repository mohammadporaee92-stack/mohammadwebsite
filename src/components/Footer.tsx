import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Cats } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { pick } from "@/lib/i18n";
import Logo from "./Logo";

function SocialIcon({ name }: { name: string }) {
  const cls = "w-5 h-5";
  if (name === "instagram")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" /></svg>
    );
  if (name === "linkedin")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true"><path d="M6.5 8.8v11.4H3V8.8h3.5zM4.7 3.5a2 2 0 1 1 0 4.1 2 2 0 0 1 0-4.1zM20.5 13.4v6.8h-3.5v-6.1c0-1.5-.7-2.4-1.9-2.4-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9v6.2H9.6V8.8h3.5v1.5c.5-.7 1.3-1.8 3.2-1.8 2.4 0 4.2 1.6 4.2 4.9z" /></svg>
    );
  if (name === "youtube")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true"><path d="M22 8.2s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C16.4 5 12 5 12 5s-4.4 0-7.2.2c-.4.1-1.2.1-2 .9C2.2 6.7 2 8.2 2 8.2S1.8 10 1.8 11.7v1.6C1.8 15 2 16.8 2 16.8s.2 1.5.8 2.1c.8.8 1.8.8 2.2.9 1.6.2 7 .2 7 .2s4.4 0 7.2-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.5v-1.6c0-1.7-.2-3.5-.2-3.5zM9.9 14.9V9.7l5.4 2.6-5.4 2.6z" /></svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true"><path d="M21.9 4.6 2.7 12.1c-.8.3-.8 1.4.1 1.6l4.6 1.4 1.8 5.4c.3.8 1.3.9 1.8.2l2.6-3 4.9 3.6c.6.5 1.6.1 1.8-.7l2.5-14c.2-1.1-1-1.9-1.9-1.4zM8.5 13.3l9.2-6.6c.2-.2.5.1.3.3l-7.7 7.3-.3 3-1.5-4z" /></svg>
  );
}

export default async function Footer({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const s = await getSettings(["instagram", "linkedin", "youtube", "telegram", "contact_email", "site_name_fa", "site_name_en"]);
  const cats = Cats.all("tutorial").slice(0, 6);

  const socials = [
    { name: "instagram", url: `https://instagram.com/${s.instagram || "mohammad_por_ai"}`, always: true },
    { name: "linkedin", url: s.linkedin, always: false },
    { name: "youtube", url: s.youtube, always: false },
    { name: "telegram", url: s.telegram, always: false },
  ].filter((x) => x.always || x.url);

  const quick = [
    { href: `/${lang}`, label: d.nav.home },
    { href: `/${lang}/learn`, label: d.nav.learn },
    { href: `/${lang}/courses`, label: d.nav.courses },
    { href: `/${lang}/tools`, label: d.nav.tools },
    { href: `/${lang}/projects`, label: d.nav.projects },
    { href: `/${lang}/blog`, label: d.nav.blog },
    { href: `/${lang}/journey`, label: d.nav.journey },
    { href: `/${lang}/about`, label: d.nav.about },
    { href: `/${lang}/work`, label: d.nav.work },
    { href: `/${lang}/contact`, label: d.nav.contact },
  ];

  return (
    <footer className="bg-navy-950 text-slate-300 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo lang={lang} dark />
          <p className="mt-4 text-sm leading-7 text-slate-400">{d.footer.about}</p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((x) => (
              <a key={x.name} href={x.url} target="_blank" rel="noopener" aria-label={x.name}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-tech-500 hover:border-tech-500 hover:text-white transition">
                <SocialIcon name={x.name} />
              </a>
            ))}
          </div>
          <a href={`https://instagram.com/${s.instagram || "mohammad_por_ai"}`} target="_blank" rel="noopener"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-sky-glow hover:text-white transition" dir="ltr">
            <SocialIcon name="instagram" /> @{s.instagram || "mohammad_por_ai"}
          </a>
        </div>

        <nav aria-label="footer">
          <h3 className="text-white font-extrabold text-sm tracking-wide mb-4">{d.footer.quickLinks}</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {quick.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white transition">{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="categories">
          <h3 className="text-white font-extrabold text-sm tracking-wide mb-4">{d.footer.categories}</h3>
          <ul className="space-y-2.5 text-sm">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link href={`/${lang}/learn/category/${c.slug}`} className="hover:text-white transition">
                  {pick(c, "name", lang)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-white font-extrabold text-sm tracking-wide mb-4">{d.footer.connect}</h3>
          <ul className="space-y-3 text-sm">
            {s.contact_email && (
              <li>
                <a href={`mailto:${s.contact_email}`} className="hover:text-white transition break-all" dir="ltr">{s.contact_email}</a>
              </li>
            )}
            <li>
              <Link href={`/${lang}/work`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-bold hover:brightness-110 transition">
                {d.nav.work}
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/contact`} className="hover:text-white transition">{d.nav.contact}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {lang === "fa" ? s.site_name_fa : s.site_name_en} — {d.footer.rights}</p>
          <p className="flex items-center gap-4">
            <Link href={`/${lang}/privacy`} className="hover:text-slate-300 transition">{d.footer.privacy}</Link>
            <Link href={`/${lang}/terms`} className="hover:text-slate-300 transition">{d.footer.terms}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
