import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLang, type Lang } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  return [{ lang: "fa" }, { lang: "en" }];
}

// DB-driven + auth-aware pages: always render dynamically (fresh content, correct user state).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const s = await getSettings(["seo_title_fa", "seo_title_en", "seo_desc_fa", "seo_desc_en", "site_name_fa", "site_name_en"]);
  const title = l === "fa" ? s.seo_title_fa : s.seo_title_en;
  const description = l === "fa" ? s.seo_desc_fa : s.seo_desc_en;
  return {
    title: { default: title, template: `%s | ${l === "fa" ? s.site_name_fa : s.site_name_en}` },
    description,
    alternates: {
      canonical: absoluteUrl(`/${l}`),
      languages: { fa: absoluteUrl("/fa"), en: absoluteUrl("/en") },
    },
    openGraph: {
      type: "website",
      locale: l === "fa" ? "fa_IR" : "en_US",
      url: absoluteUrl(`/${l}`),
      siteName: l === "fa" ? s.site_name_fa : s.site_name_en,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:bg-white focus:text-navy-900 focus:px-4 focus:py-2 focus:rounded-lg font-bold">
        {lang === "fa" ? "پرش به محتوا" : "Skip to content"}
      </a>
      <Navbar lang={lang} />
      <main id="main" className="flex-1">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
