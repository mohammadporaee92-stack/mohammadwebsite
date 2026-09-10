import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { getCurrentUser, isStaff } from "@/lib/session";
import { absoluteUrl } from "@/lib/utils";
import { OtpLoginForm } from "@/components/forms";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const l: Lang = isLang(lang) ? lang : "fa";
  return { title: l === "fa" ? "ثبت‌نام" : "Sign up", robots: { index: false, follow: false }, alternates: { canonical: absoluteUrl(`/${l}/auth/register`) } };
}

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const user = await getCurrentUser();
  if (user) redirect(isStaff(user.role) ? `/${lang}/admin` : `/${lang}/dashboard`);

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-14">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8">
        <div className="text-center mb-6">
          <p className="text-4xl">🚀</p>
          <h1 className="mt-3 text-2xl font-extrabold text-navy-900">{lang === "fa" ? "ساخت حساب" : "Create account"}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{d.auth.loginSub}</p>
        </div>
        <OtpLoginForm
          lang={lang}
          mode="register"
          dict={{
            phoneLabel: d.auth.phoneLabel,
            phonePlaceholder: d.auth.phonePlaceholder,
            sendCode: d.auth.sendCode,
            codeLabel: d.auth.codeLabel,
            verify: d.auth.verify,
            resend: d.auth.resend,
            backToPhone: d.auth.backToPhone,
            demoBox: d.auth.demoBox,
            demoHint: d.auth.demoHint,
            nameLabel: d.dashboard.name,
            errors: d.auth.errors,
          }}
        />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href={`/${lang}/auth/login`} className="font-extrabold text-tech-600 hover:text-tech-500">
            {lang === "fa" ? "حساب داری؟ ورود" : "Have an account? Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
