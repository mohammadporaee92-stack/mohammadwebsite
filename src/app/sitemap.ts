import type { MetadataRoute } from "next";
import { Articles, Courses, Tools, Projects, Cats } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

const STATIC = ["", "/learn", "/courses", "/tools", "/projects", "/blog", "/journey", "/about", "/work", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  for (const lang of ["fa", "en"]) {
    for (const p of STATIC) {
      urls.push({ url: `${base}/${lang}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    }
  }

  const articles = Articles.allSlugs();
  const courses = Courses.allSlugs();
  const tools = Tools.allSlugs();
  const projects = Projects.allSlugs();
  const cats = Cats.all("tutorial");

  for (const lang of ["fa", "en"]) {
    for (const a of articles) {
      urls.push({ url: `${base}/${lang}/${a.kind === "tutorial" ? "learn" : "blog"}/${a.slug}`, lastModified: new Date(a.updatedAt), changeFrequency: "monthly", priority: 0.8 });
    }
    for (const c of courses) urls.push({ url: `${base}/${lang}/courses/${c.slug}`, lastModified: new Date(c.updatedAt), changeFrequency: "weekly", priority: 0.9 });
    for (const t of tools) urls.push({ url: `${base}/${lang}/tools/${t.slug}`, lastModified: new Date(t.updatedAt), changeFrequency: "monthly", priority: 0.6 });
    for (const p of projects) urls.push({ url: `${base}/${lang}/projects/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "monthly", priority: 0.6 });
    for (const c of cats) urls.push({ url: `${base}/${lang}/learn/category/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  }

  return urls;
}
