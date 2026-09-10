import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import { LeadForm } from "@/components/forms";
import { ProfilePhoto } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.contact.title,
    description: d.contact.sub,
    alternates: { canonical: absoluteUrl(`/${l}/contact`) },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const s = await getSettings(["instagram", "linkedin", "youtube", "telegram", "contact_email"]);

  const socials = [
    { name: "Instagram", handle: `@${s.instagram}`, url: `https://instagram.com/${s.instagram}` },
    ...(s.linkedin ? [{ name: "LinkedIn", handle: "LinkedIn", url: s.linkedin }] : []),
    ...(s.youtube ? [{ name: "YouTube", handle: "YouTube", url: s.youtube }] : []),
    ...(s.telegram ? [{ name: "Telegram", handle: "Telegram", url: s.telegram }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900">{d.contact.title}</h1>
        <p className="mt-2 text-slate-500">{d.contact.sub}</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-navy-800 to-navy-950 text-white rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
            <div className="relative flex items-center gap-4">
              <ProfilePhoto lang={lang} size="sm" />
              <div>
                <p className="font-extrabold text-lg">{lang === "fa" ? "محمد پورائی" : "Mohammad Pouraei"}</p>
                <p className="text-sm text-slate-300">{d.brandTagline}</p>
              </div>
            </div>
            {s.contact_email && (
              <a href={`mailto:${s.contact_email}`} className="relative mt-4 block font-bold text-sky-glow hover:text-white transition" dir="ltr">
                ✉️ {s.contact_email}
              </a>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6">
            <h2 className="font-extrabold text-navy-900 mb-4">{d.footer.connect}</h2>
            <div className="space-y-2">
              {socials.map((x) => (
                <a key={x.name} href={x.url} target="_blank" rel="noopener"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-navy-900 hover:text-white transition font-bold text-sm">
                  <span>{x.name}</span>
                  <span dir="ltr" className="text-sky-600">{x.handle}</span>
                </a>
              ))}
            </div>
          </div>

          <Link href={`/${lang}/work`} className="block text-center px-6 py-4 rounded-2xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-extrabold shadow-lg hover:brightness-110 transition">
            {d.nav.work}
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8">
          <LeadForm
            endpoint="/api/contact"
            sendLabel={d.contact.send}
            doneMessage={d.contact.done}
            fields={[
              { name: "name", label: d.contact.name, required: true },
              { name: "email", label: d.contact.email, type: "email", required: true },
              { name: "subject", label: d.contact.subject, full: true },
              { name: "message", label: d.contact.message, textarea: true, required: true, full: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
