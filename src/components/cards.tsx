import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { pick, fmtNum, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getSetting } from "@/lib/settings";
import { getInstagramFeed, instagramUrl, instagramUsername } from "@/lib/instagram";
import { BookmarkButton } from "./forms";
import ProfilePhotoImg from "./ProfilePhotoImg";
import { cx } from "@/lib/utils";

// ---------- helpers ----------

const GRADIENTS = [
  "from-blue-600 via-blue-700 to-navy-900",
  "from-sky-500 via-blue-600 to-navy-800",
  "from-navy-700 via-navy-900 to-navy-950",
  "from-indigo-600 via-blue-700 to-navy-900",
  "from-cyan-600 via-sky-700 to-navy-900",
  "from-blue-700 via-indigo-800 to-navy-950",
];

export function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function CategoryGlyph({ name, className }: { name: string; className?: string }) {
  const ch = (name || "?").trim().charAt(0);
  return (
    <span className={cx("grid place-items-center rounded-xl bg-gradient-to-br text-white font-extrabold shrink-0", gradientFor(name), className || "w-11 h-11 text-lg")}>
      {ch}
    </span>
  );
}

// ---------- section heading ----------

export function SectionHeading({ kicker, title, sub, align = "center" }: { kicker?: string; title: string; sub?: string; align?: "center" | "start" }) {
  return (
    <div className={cx("mb-8", align === "center" ? "text-center mx-auto max-w-2xl" : "text-start")}>
      {kicker && (
        <p className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest uppercase text-tech-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 mb-3">
          {kicker}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 leading-snug">{title}</h2>
      {sub && <p className="mt-2 text-slate-500 leading-7">{sub}</p>}
    </div>
  );
}

// ---------- profile photo (image or elegant monogram placeholder) ----------

export async function ProfilePhoto({ lang, size = "lg" }: { lang: Lang; size?: "lg" | "md" | "sm" }) {
  const [img, ig] = await Promise.all([
    getSetting("profile_image", ""),
    getSetting("instagram", "mohammad_por_ai"),
  ]);
  const dims = size === "lg" ? "w-44 h-44 sm:w-56 sm:h-56 text-5xl" : size === "md" ? "w-28 h-28 text-3xl" : "w-16 h-16 text-xl";
  if (img) {
    return <ProfilePhotoImg src={img} alt={lang === "fa" ? "محمد پورائی" : "Mohammad Pouraei"} dims={dims} ig={ig} />;
  }
  return (
    <div className={cx("relative grid place-items-center rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white shadow-2xl shadow-blue-900/25 ring-4 ring-white overflow-hidden", dims)}>
      <div className="absolute inset-0 bg-blueprint opacity-70" aria-hidden="true" />
      <div className="absolute -bottom-6 -end-6 w-28 h-28 rounded-full bg-tech-500/30 blur-2xl" aria-hidden="true" />
      <span className="relative font-extrabold tracking-tight" dir="ltr">MP</span>
      <span className="absolute bottom-2 inset-x-0 text-center text-[10px] font-semibold text-sky-200/90 px-2">
        {lang === "fa" ? `@${ig}` : `@${ig}`}
      </span>
    </div>
  );
}

// ---------- course card ----------

export type CourseCardData = {
  slug: string; titleFa: string; titleEn: string; descFa: string; descEn: string;
  coverUrl: string | null; priceType: string; priceIrt: number | null; priceUsd: number | null;
  level: string; _count?: { modules: number };
};

export function CourseCard({ lang, course, lessonCount, minutes, progress }: { lang: Lang; course: CourseCardData; lessonCount?: number; minutes?: number; progress?: number }) {
  const d = getDict(lang);
  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <Link href={`/${lang}/courses/${course.slug}`} className="block relative h-40 overflow-hidden" aria-label={pick(course, "title", lang)}>
        {course.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        ) : (
          <div className={cx("w-full h-full bg-gradient-to-br flex items-center justify-center", gradientFor(course.slug))}>
            <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /><path d="M9 8h7M9 11h5" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <span className={cx("absolute top-3 start-3 text-xs font-extrabold px-2.5 py-1 rounded-full shadow", course.priceType === "free" ? "bg-emerald-500 text-white" : "bg-amber-400 text-navy-950")}>
          {course.priceType === "free" ? d.home.free : d.home.paid}
        </span>
      </Link>
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/${lang}/courses/${course.slug}`} className="font-extrabold text-navy-900 leading-7 hover:text-tech-600 transition line-clamp-2">
          {pick(course, "title", lang)}
        </Link>
        <p className="mt-2 text-sm text-slate-500 leading-6 line-clamp-2">{pick(course, "desc", lang)}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
            {fmtNum(minutes ?? 0, lang)} {d.home.min}
          </span>
          <span>•</span>
          <span>{fmtNum(lessonCount ?? 0, lang)} {d.home.lessons}</span>
          <span>•</span>
          <span>{course.level === "beginner" ? d.courses.levelBeginner : course.level === "advanced" ? d.courses.levelAdvanced : d.courses.levelIntermediate}</span>
        </div>
        {typeof progress === "number" && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-tech-500 to-sky-glow" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-xs font-bold text-tech-600">{fmtNum(progress, lang)}٪ {d.dashboard.progress}</p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-extrabold text-navy-900">
            {course.priceType === "free" ? d.home.free : lang === "fa" ? `${fmtNum(course.priceIrt || 0, lang)} تومان` : `$${course.priceUsd || 0}`}
          </span>
          <Link href={`/${lang}/courses/${course.slug}`} className="text-sm font-bold text-tech-600 hover:text-tech-500 transition">
            {d.common.readMore} ←
          </Link>
        </div>
      </div>
    </article>
  );
}

// ---------- article / tutorial card ----------

export type ArticleCardData = {
  id: string; slug: string; kind: string; titleFa: string; titleEn: string;
  excerptFa: string | null; excerptEn: string | null; coverUrl: string | null;
  difficulty: string | null; readMinutes: number; views: number;
  createdAt: string | Date; category?: { slug: string; nameFa: string; nameEn: string } | null;
};

export function ArticleCard({ lang, article, base, bookmarked }: { lang: Lang; article: ArticleCardData; base: "learn" | "blog"; bookmarked?: boolean }) {
  const d = getDict(lang);
  const diff = article.difficulty === "beginner" ? d.common.beginner : article.difficulty === "advanced" ? d.common.advanced : d.common.intermediate;
  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <Link href={`/${lang}/${base}/${article.slug}`} className="block relative h-40 overflow-hidden" aria-label={pick(article, "title", lang)}>
        {article.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        ) : (
          <div className={cx("w-full h-full bg-gradient-to-br", gradientFor(article.slug))}>
            <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
          </div>
        )}
        <span className="absolute top-3 start-3 text-xs font-extrabold px-2.5 py-1 rounded-full bg-navy-950/85 text-white backdrop-blur">
          {article.kind === "tutorial" ? d.nav.learn : d.nav.blog}
        </span>
      </Link>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/${lang}/${base}/${article.slug}`} className="font-extrabold text-navy-900 leading-7 hover:text-tech-600 transition line-clamp-2">
            {pick(article, "title", lang)}
          </Link>
          <BookmarkButton targetType="article" targetId={article.id} initial={!!bookmarked} labels={{ save: d.common.save, saved: d.common.saved, login: d.common.loginNeeded }} />
        </div>
        <p className="mt-2 text-sm text-slate-500 leading-6 line-clamp-2">{pick(article, "excerpt", lang)}</p>
        <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-tech-600 font-bold">{diff}</span>
          <span>{fmtNum(article.readMinutes, lang)} {d.common.minRead}</span>
          <span>•</span>
          <span>{fmtDate(article.createdAt, lang)}</span>
        </div>
      </div>
    </article>
  );
}

// ---------- tool card ----------

export type ToolCardData = {
  id: string; slug: string; name: string; logoUrl: string | null;
  descFa: string; descEn: string; pricing: string; website: string | null;
};

export function ToolCard({ lang, tool, bookmarked }: { lang: Lang; tool: ToolCardData; bookmarked?: boolean }) {
  const d = getDict(lang);
  const pricingLabel = tool.pricing === "free" ? d.home.free : tool.pricing === "paid" ? d.home.paid : lang === "fa" ? "فریمیوم" : "Freemium";
  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {tool.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tool.logoUrl} alt="" className="w-11 h-11 rounded-xl object-cover" loading="lazy" />
          ) : (
            <CategoryGlyph name={tool.name} />
          )}
          <div>
            <Link href={`/${lang}/tools/${tool.slug}`} className="font-extrabold text-navy-900 hover:text-tech-600 transition" dir="ltr">{tool.name}</Link>
            <p><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-tech-600">{pricingLabel}</span></p>
          </div>
        </div>
        <BookmarkButton targetType="tool" targetId={tool.id} initial={!!bookmarked} labels={{ save: d.common.save, saved: d.common.saved, login: d.common.loginNeeded }} />
      </div>
      <p className="mt-3 text-sm text-slate-500 leading-6 line-clamp-3 flex-1">{pick(tool, "desc", lang)}</p>
      <div className="mt-4 flex items-center gap-3 text-sm font-bold">
        <Link href={`/${lang}/tools/${tool.slug}`} className="text-tech-600 hover:text-tech-500 transition">{d.common.readMore}</Link>
        {tool.website && <a href={tool.website} target="_blank" rel="noopener" className="text-slate-400 hover:text-navy-900 transition" dir="ltr">↗ {lang === "fa" ? "سایت رسمی" : "Website"}</a>}
      </div>
    </article>
  );
}

// ---------- project card ----------

export type ProjectCardData = {
  slug: string; titleFa: string; titleEn: string; summaryFa: string; summaryEn: string;
  coverUrl: string | null; toolsUsed: string;
};

export function ProjectCard({ lang, project }: { lang: Lang; project: ProjectCardData }) {
  const d = getDict(lang);
  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <Link href={`/${lang}/projects/${project.slug}`} className="block relative h-36 overflow-hidden" aria-label={pick(project, "title", lang)}>
        {project.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        ) : (
          <div className={cx("w-full h-full bg-gradient-to-br", gradientFor(project.slug))}>
            <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/${lang}/projects/${project.slug}`} className="font-extrabold text-navy-900 leading-7 hover:text-tech-600 transition">
          {pick(project, "title", lang)}
        </Link>
        <p className="mt-2 text-sm text-slate-500 leading-6 line-clamp-2 flex-1">{pick(project, "summary", lang)}</p>
        {project.toolsUsed && (
          <p className="mt-3 flex flex-wrap gap-1.5" dir="ltr">
            {project.toolsUsed.split(",").slice(0, 4).map((t) => (
              <span key={t} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{t.trim()}</span>
            ))}
          </p>
        )}
        <Link href={`/${lang}/projects/${project.slug}`} className="mt-4 text-sm font-bold text-tech-600 hover:text-tech-500 transition">
          {d.common.readMore} ←
        </Link>
      </div>
    </article>
  );
}

// ---------- category card ----------

export function CategoryCard({ lang, category, count }: { lang: Lang; category: { slug: string; nameFa: string; nameEn: string; descFa: string | null; descEn: string | null }; count?: number }) {
  return (
    <Link href={`/${lang}/learn/category/${category.slug}`} className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-tech-500/40 transition-all duration-300 p-5 flex items-start gap-4">
      <CategoryGlyph name={pick(category, "name", lang)} />
      <span>
        <span className="block font-extrabold text-navy-900 group-hover:text-tech-600 transition">
          {pick(category, "name", lang)}
          {typeof count === "number" && <span className="ms-2 text-xs font-bold text-slate-400">({fmtNum(count, lang)})</span>}
        </span>
        <span className="block mt-1 text-sm text-slate-500 leading-6 line-clamp-2">{pick(category, "desc", lang)}</span>
      </span>
    </Link>
  );
}

// ---------- stats ----------

export function Stats({ lang, items }: { lang: Lang; items: Array<{ value: number; suffix?: string; label: string }> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it.label} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-center">
          <p className="text-3xl font-extrabold text-navy-900" dir="ltr">{fmtNum(it.value, lang)}{it.suffix || ""}<span className="text-tech-500">+</span></p>
          <p className="mt-1 text-sm text-slate-500 font-semibold">{it.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------- work-with-me CTA ----------

export function CTAWork({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 text-white p-8 sm:p-12 shadow-2xl shadow-blue-900/20">
      <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
      <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-tech-500/25 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">{d.work.title}</h2>
          <p className="mt-2 text-slate-300 leading-7">{d.work.sub}</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href={`/${lang}/work`} className="px-6 py-3 rounded-xl bg-white text-navy-900 font-extrabold hover:bg-blue-50 transition shadow-lg">
            {d.work.formTitle}
          </Link>
          <Link href={`/${lang}/contact`} className="px-6 py-3 rounded-xl border border-white/30 font-bold hover:bg-white/10 transition">
            {d.nav.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------- instagram section (API-ready, graceful placeholder) ----------

export async function InstagramSection({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const posts = await getInstagramFeed(6);
  const username = instagramUsername();
  return (
    <section aria-label="Instagram">
      <SectionHeading title={d.home.igTitle} sub={d.home.igSub} />
      {posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((p) => (
            <a key={p.id} href={p.permalink} target="_blank" rel="noopener" className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.mediaUrl} alt={p.caption.slice(0, 80)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
            </a>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <a key={i} href={instagramUrl()} target="_blank" rel="noopener"
              className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950 text-white p-6 min-h-44 flex flex-col justify-between hover:shadow-xl transition">
              <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" /></svg>
              <p className="relative text-sm leading-6 text-slate-300">
                {lang === "fa" ? "آموزش‌های کوتاه روزانه را در اینستاگرام ببین" : "Watch short daily lessons on Instagram"}
              </p>
              <p className="relative font-extrabold text-sky-glow group-hover:text-white transition" dir="ltr">@{username}</p>
            </a>
          ))}
        </div>
      )}
      <div className="mt-6 text-center">
        <a href={instagramUrl()} target="_blank" rel="noopener"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-orange-400 text-white font-extrabold shadow-lg hover:brightness-110 transition">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" /></svg>
          {d.home.igFollow} · <span dir="ltr">@{username}</span>
        </a>
      </div>
    </section>
  );
}
