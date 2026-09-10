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
  return { title: d.footer.terms, alternates: { canonical: absoluteUrl(`/${l}/terms`) } };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const body = lang === "fa"
    ? `## قوانین استفاده\n\nبا استفاده از این وب‌سایت، قوانین زیر را می‌پذیری:\n\n## محتوای آموزشی\n\n- محتوای دوره‌ها و آموزش‌ها برای استفاده شخصی توست.\n- بازنشر یا فروش محتوا بدون اجازه کتبی ممنوع است.\n\n## حساب کاربری\n\n- مسئول حفظ دسترسی به شماره موبایلت هستی.\n- هرگونه سوءاستفاده باعث مسدود شدن حساب می‌شود.\n\n## سلب مسئولیت\n\n- محتوای آموزشی با نهایت دقت تهیه می‌شود اما تضمینی برای نتیجه خاص وجود ندارد.\n- خروجی ابزارهای AI همیشه باید توسط انسان راستی‌آزمایی شود.`
    : `## Terms of Service\n\nBy using this website you accept the following:\n\n## Educational content\n\n- Course and tutorial content is for your personal use.\n- Republishing or reselling content without written permission is prohibited.\n\n## Accounts\n\n- You are responsible for keeping access to your mobile number.\n- Abuse leads to account suspension.\n\n## Disclaimer\n\n- Content is prepared with care but no specific outcome is guaranteed.\n- AI tool outputs must always be verified by a human.`;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-extrabold text-navy-900">{d.footer.terms}</h1>
      <article className="mt-6 bg-white rounded-3xl border border-slate-200/80 p-8">
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: renderRich(body) }} />
      </article>
    </div>
  );
}
