import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Courses } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";
import { SectionHeading, CourseCard } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.nav.courses,
    description: d.home.featuredCoursesSub,
    alternates: { canonical: absoluteUrl(`/${l}/courses`), languages: { fa: absoluteUrl("/fa/courses"), en: absoluteUrl("/en/courses") } },
  };
}

export default async function CoursesIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const courses = Courses.list({ status: "published", limit: 60 });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <SectionHeading title={d.nav.courses} sub={d.home.featuredCoursesSub} />
      {courses.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {courses.map((c) => (
            <CourseCard key={c.slug} lang={lang} course={c} lessonCount={c.lessonCount} minutes={c.minutes} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">{d.search.noResults}</div>
      )}
    </div>
  );
}
