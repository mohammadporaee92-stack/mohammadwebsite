import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import JsonLd from "@/components/JsonLd";
import { ProfilePhoto, CTAWork, InstagramSection } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.nav.about,
    alternates: { canonical: absoluteUrl(`/${l}/about`), languages: { fa: absoluteUrl("/fa/about"), en: absoluteUrl("/en/about") } },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const s = await getSettings(["bio_fa", "bio_en", "instagram", "linkedin", "contact_email"]);

  const timeline = lang === "fa" ? [
    { year: "🎓", title: "کارشناسی ارشد مهندسی برق — دانشگاه خواجه نصیرالدین طوسی", text: "پایه مهندسی من: سیستم‌های قدرت، کنترل و تفکر سیستمی." },
    { year: "⚙️", title: "مهندس در صنعت نفت و گاز", text: "کار واقعی در صنعت: پروژه، مدارک فنی، استانداردها و مسئولیت." },
    { year: "🤖", title: "ورود جدی به هوش مصنوعی", text: "یادگیری عمیق AI به‌عنوان ابزار کار، نه فقط یک علاقه." },
    { year: "🚀", title: "PorAI: آموزش و ساختن علنی", text: "امروز: آموزش AI کاربردی، اتوماسیون و مشاوره برای مهندسان و کسب‌وکارها." },
  ] : [
    { year: "🎓", title: "MSc in Electrical Engineering — K. N. Toosi University", text: "My engineering foundation: power systems, control and systems thinking." },
    { year: "⚙️", title: "Engineer in the Oil & Gas industry", text: "Real industry work: projects, technical docs, standards and responsibility." },
    { year: "🤖", title: "Going deep into AI", text: "Learning AI seriously as a work tool, not just a hobby." },
    { year: "🚀", title: "PorAI: teaching & building in public", text: "Today: practical AI education, automation and consulting for engineers and businesses." },
  ];

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Mohammad Poraee",
        alternateName: "محمد پرایی",
        url: absoluteUrl(`/${lang}/about`),
        jobTitle: "Electrical Engineer & AI Educator",
        alumniOf: { "@type": "CollegeOrUniversity", name: "K. N. Toosi University of Technology" },
        sameAs: [`https://instagram.com/${s.instagram || "mohammad_por_ai"}`],
      }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-16">
        {/* header */}
        <section className="grid lg:grid-cols-[auto_1fr] gap-8 items-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
          <div className="flex justify-center">
            <ProfilePhoto lang={lang} size="lg" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-tech-600 tracking-wide">PorAI · {d.brandTagline}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy-900">
              {lang === "fa" ? "محمد پرایی" : "Mohammad Poraee"}
            </h1>
            <p className="mt-4 text-slate-600 leading-8 whitespace-pre-line">{lang === "fa" ? s.bio_fa : s.bio_en}</p>
            <p className="mt-4 inline-flex text-sm font-extrabold text-navy-900 bg-blue-50 border border-blue-100 rounded-full px-4 py-2">
              {d.hero.philosophy}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`https://instagram.com/${s.instagram || "mohammad_por_ai"}`} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-orange-400 text-white text-sm font-extrabold shadow hover:brightness-110 transition">
                {d.home.igFollow} · <span dir="ltr">@{s.instagram || "mohammad_por_ai"}</span>
              </a>
              <Link href={`/${lang}/work`} className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
                {d.hero.ctaWork}
              </Link>
              {s.contact_email && (
                <a href={`mailto:${s.contact_email}`} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-navy-900 hover:text-navy-900 transition" dir="ltr">
                  {s.contact_email}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* timeline */}
        <section aria-label="timeline">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-6 text-center">{lang === "fa" ? "مسیر من" : "My Journey"}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {timeline.map((t) => (
              <div key={t.title} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
                <p className="text-3xl">{t.year}</p>
                <h3 className="mt-3 font-extrabold text-navy-900 leading-7">{t.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-6">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${lang}/journey`} className="text-tech-600 font-extrabold hover:text-tech-500 transition">
              {d.home.journeyTitle} ←
            </Link>
          </div>
        </section>

        {/* what I believe */}
        <section className="grid md:grid-cols-3 gap-4" aria-label="principles">
          {(lang === "fa" ? [
            { t: "عمل‌گرایی، نه هایپ", x: "فقط چیزی را آموزش می‌دهم که خودم تست کرده و در کار واقعی جواب داده باشم." },
            { t: "صادقانه درباره محدودیت‌ها", x: "AI ابزار قدرتمندی است اما همه‌چیز نیست؛ محدودیت‌هایش را هم می‌گویم." },
            { t: "مهندسی × AI", x: "ترکیب دانش عمیق مهندسی با ابزارهای AI، جایی است که ارزش واقعی ساخته می‌شود." },
          ] : [
            { t: "Practice, not hype", x: "I only teach what I've personally tested on real work." },
            { t: "Honest about limits", x: "AI is powerful but not everything; I teach its limits too." },
            { t: "Engineering × AI", x: "Deep engineering knowledge combined with AI tools is where real value is created." },
          ]).map((p) => (
            <div key={p.t} className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
              <h3 className="relative font-extrabold text-lg">{p.t}</h3>
              <p className="relative mt-2 text-sm text-slate-300 leading-7">{p.x}</p>
            </div>
          ))}
        </section>

        <InstagramSection lang={lang} />
        <CTAWork lang={lang} />
      </div>
    </>
  );
}
