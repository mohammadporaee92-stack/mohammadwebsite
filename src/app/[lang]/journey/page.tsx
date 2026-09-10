import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Journey } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";
import { renderRich } from "@/lib/content";
import { CTAWork } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.home.journeyTitle,
    description: d.home.journeySub,
    alternates: { canonical: absoluteUrl(`/${l}/journey`) },
  };
}

const KIND_META: Record<string, { icon: string; fa: string; en: string }> = {
  learning: { icon: "📖", fa: "یادگیری", en: "Learning" },
  building: { icon: "🛠️", fa: "ساختن", en: "Building" },
  experiment: { icon: "🧪", fa: "آزمایش", en: "Experiment" },
  milestone: { icon: "🏁", fa: "نقطه عطف", en: "Milestone" },
  lesson: { icon: "💡", fa: "درس", en: "Lesson" },
};

export default async function JourneyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const entries = Journey.published(100);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900">{d.home.journeyTitle}</h1>
        <p className="mt-2 text-slate-500">{d.home.journeySub}</p>
        <p className="mt-3 inline-flex text-sm font-bold text-tech-600">{d.hero.philosophy}</p>
      </div>

      <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:start-[19px] before:w-0.5 before:bg-gradient-to-b before:from-tech-500 before:to-sky-glow before:rounded">
        {entries.map((e) => {
          const meta = KIND_META[e.kind] || KIND_META.learning;
          return (
            <article key={e.id} className="relative ps-14">
              <span className="absolute start-2 top-1 grid place-items-center w-9 h-9 rounded-full bg-white border-2 border-tech-500 text-lg shadow">
                {meta.icon}
              </span>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-tech-600">{lang === "fa" ? meta.fa : meta.en}</span>
                  <span className="text-slate-400 font-bold">{fmtDate(e.date, lang)}</span>
                </div>
                <h2 className="mt-2 font-extrabold text-navy-900 text-lg leading-8">{pick(e, "title", lang)}</h2>
                <div className="rich-text text-[0.95rem]" dangerouslySetInnerHTML={{ __html: renderRich(pick(e, "body", lang)) }} />
              </div>
            </article>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">{d.search.noResults}</div>
      )}

      <CTAWork lang={lang} />
    </div>
  );
}
