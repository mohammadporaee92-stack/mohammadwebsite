import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import { LeadForm } from "@/components/forms";
import { SectionHeading } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.work.title,
    description: d.work.sub,
    alternates: { canonical: absoluteUrl(`/${l}/work`) },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const s = await getSettings(["instagram", "contact_email"]);

  const services = lang === "fa" ? [
    { icon: "🧠", t: "مشاوره AI", x: "کشف فرصت‌های AI در کسب‌وکار شما و طراحی نقشه راه." },
    { icon: "⚙️", t: "اتوماسیون با AI", x: "خودکارسازی فرایندهای تکراری: گزارش‌گیری، مستندسازی، پیگیری." },
    { icon: "🏭", t: "AI برای مهندسی", x: "راه‌حل‌های AI برای مدارک فنی، گزارش‌ها و دانش مهندسی." },
    { icon: "🔗", t: "توسعه ورک‌فلو AI", x: "طراحی و ساخت ورک‌فلوهای هوشمند متصل به ابزارهای شما." },
    { icon: "🎓", t: "آموزش و کارگاه", x: "آموزش عملی AI برای تیم‌ها و سازمان‌ها." },
    { icon: "🤖", t: "توسعه ایجنت AI", x: "ساخت دستیارهای هوشمند چندمرحله‌ای برای کارهای خاص شما." },
  ] : [
    { icon: "🧠", t: "AI Consulting", x: "Finding AI opportunities in your business and building a roadmap." },
    { icon: "⚙️", t: "AI Automation", x: "Automating repetitive work: reporting, docs, follow-ups." },
    { icon: "🏭", t: "AI for Engineering", x: "AI solutions for technical docs, reports and engineering knowledge." },
    { icon: "🔗", t: "AI Workflow Development", x: "Designing smart workflows connected to your tools." },
    { icon: "🎓", t: "Training & Workshops", x: "Practical AI training for teams and organizations." },
    { icon: "🤖", t: "AI Agent Development", x: "Multi-step smart assistants for your specific work." },
  ];

  const projectTypes = lang === "fa"
    ? ["مشاوره AI", "اتوماسیون", "ایجنت AI", "آموزش سازمانی", "کارگاه", "راه‌حل مهندسی", "سایر"]
    : ["AI Consulting", "Automation", "AI Agent", "Corporate Training", "Workshop", "Engineering Solution", "Other"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white p-8 sm:p-12">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{d.work.title}</h1>
          <p className="mt-3 text-slate-300 leading-7">{d.work.sub}</p>
          {s.contact_email && (
            <a href={`mailto:${s.contact_email}`} className="mt-4 inline-block text-sky-glow font-bold hover:text-white transition" dir="ltr">
              {s.contact_email}
            </a>
          )}
        </div>
      </section>

      <section>
        <SectionHeading title={d.work.services} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((sv) => (
            <div key={sv.t} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
              <p className="text-3xl">{sv.icon}</p>
              <h2 className="mt-3 font-extrabold text-navy-900">{sv.t}</h2>
              <p className="mt-1.5 text-sm text-slate-500 leading-6">{sv.x}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:sticky lg:top-24">
          <h2 className="font-extrabold text-navy-900 text-lg">{lang === "fa" ? "چطور کار می‌کنیم؟" : "How we work"}</h2>
          <ol className="mt-4 space-y-4">
            {(lang === "fa" ? [
              ["۱", "فرم را پر کن", "در ۲ دقیقه نیازت را بنویس؛ حتی اگر مطمئن نیستی."],
              ["۲", "جلسه کشف", "صحبت می‌کنیم و دقیق می‌فهمیم چه چیزی ارزش ساخت دارد."],
              ["۳", "پروپوزال شفاف", "محدوده کار، زمان و هزینه مشخص و شفاف."],
              ["۴", "اجرا و تحویل", "ساخت قدم‌به‌قدم با بازخورد مداوم تو."],
            ] : [
              ["1", "Fill the form", "Describe your need in 2 minutes — even if unsure."],
              ["2", "Discovery call", "We talk and pinpoint what's worth building."],
              ["3", "Clear proposal", "Transparent scope, timeline and cost."],
              ["4", "Build & deliver", "Step-by-step build with your feedback."],
            ]).map(([n, t, x]) => (
              <li key={t} className="flex gap-3">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-navy-900 text-white text-sm font-extrabold shrink-0">{n}</span>
                <span>
                  <span className="block font-extrabold text-navy-900 text-sm">{t}</span>
                  <span className="block text-sm text-slate-500 mt-0.5">{x}</span>
                </span>
              </li>
            ))}
          </ol>
          <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener" className="mt-5 block text-center text-sm font-extrabold text-sky-600" dir="ltr">
            Instagram · @{s.instagram}
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <h2 className="font-extrabold text-navy-900 text-lg mb-5">{d.work.formTitle}</h2>
          <LeadForm
            endpoint="/api/inquiries"
            sendLabel={d.work.send}
            doneMessage={d.work.done}
            fields={[
              { name: "name", label: d.work.name, required: true },
              { name: "company", label: d.work.company },
              { name: "email", label: d.work.email, type: "email" },
              { name: "phone", label: d.work.phone },
              { name: "country", label: d.work.country },
              { name: "projectType", label: d.work.projectType, options: projectTypes },
              { name: "budget", label: d.work.budget, full: true },
              { name: "message", label: d.work.message, textarea: true, required: true, full: true },
              { name: "unsure", label: d.work.unsure, type: "checkbox", full: true },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
