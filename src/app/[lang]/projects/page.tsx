import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Projects } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";
import { SectionHeading, ProjectCard } from "@/components/cards";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return {
    title: d.nav.projects,
    description: d.home.projectsSub,
    alternates: { canonical: absoluteUrl(`/${l}/projects`) },
  };
}

export default async function ProjectsIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const projects = Projects.list({ status: "published", limit: 60 });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <SectionHeading title={d.nav.projects} sub={d.home.projectsSub} />
      {projects.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.slug} lang={lang} project={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">{d.search.noResults}</div>
      )}
    </div>
  );
}
