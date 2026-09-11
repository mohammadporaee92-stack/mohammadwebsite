import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { absoluteUrl } from "@/lib/utils";
import { renderRich } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  const d = getDict(l);
  return { title: d.footer.privacy, alternates: { canonical: absoluteUrl(`/${l}/privacy`) } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const body = lang === "fa"
    ? `## حریم خصوصی شما\n\nما شماره موبایل شما را برای شناسه حساب و ورود با رمز استفاده می‌کنیم ؛ در این نسخه پیامک ارسال نمی‌شود.\n\n## چه داده‌هایی ذخیره می‌شود؟\n\n- شماره موبایل، نام (اختیاری) و ایمیل (اختیاری)\n- دوره‌های ثبت‌نام‌شده و پیشرفت یادگیری\n- محتوای ذخیره‌شده و تاریخچه بازدید\n\n## امنیت\n\n- ورود با رمز عبور؛ ذخیره هش رمز به‌جای خود رمز\n- محدودیت نرخ و محافظت در برابر حملات\n- نشست‌های امن (httpOnly cookies)\n\n## حذف حساب\n\nهر زمان که بخواهی می‌توانی از صفحه تماس، حذف کامل حسابت را درخواست کنی.`
    : `## Your Privacy\n\nWe use your mobile number as your account identifier for password login. This edition does not send SMS.\n\n## What data is stored?\n\n- Mobile number, name (optional) and email (optional)\n- Enrolled courses and learning progress\n- Saved content and view history\n\n## Security\n\n- Password login with a hashed password stored instead of plaintext\n- Rate limiting and brute-force protection\n- Secure sessions (httpOnly cookies)\n\n## Account deletion\n\nYou can request full deletion of your account anytime through the contact page.`;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold text-navy-900">{d.footer.privacy}</h1>
      <article className="mt-6 bg-white rounded-3xl border border-slate-200/80 p-8">
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: renderRich(body) }} />
      </article>
    </div>
  );
}
