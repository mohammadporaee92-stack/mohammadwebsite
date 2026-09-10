import { notFound } from "next/navigation";
import { isLang, type Lang, fmtNum, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Subs } from "@/lib/db";
import { toggleSubscriber } from "../actions";
import { cx } from "@/lib/utils";

export default async function AdminNewsletter({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const list = Subs.list(500);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-navy-900">{d.admin.newsletter} ({fmtNum(list.filter((s) => s.active === 1).length, lang)})</h1>
      <p className="text-xs text-slate-400">
        {lang === "fa"
          ? "اعضا در دیتابیس محلی ذخیره می‌شوند. برای ارسال ایمیل انبوه، بعداً یک سرویس ایمیل (Resend/Mailchimp) متصل می‌کنیم."
          : "Subscribers are stored locally. Connect an email provider (Resend/Mailchimp) later for bulk sending."}
      </p>
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {list.map((s) => (
            <li key={s.id as string} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className={cx("w-2 h-2 rounded-full shrink-0", s.active === 1 ? "bg-emerald-500" : "bg-slate-300")} />
              <span className="font-bold flex-1 truncate" dir="ltr">{s.email as string}</span>
              <span className="text-[11px] text-slate-400">{s.lang as string} · {fmtDate(s.createdAt as string, lang)}</span>
              <form action={toggleSubscriber}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="email" value={s.email as string} />
                <input type="hidden" name="active" value={s.active === 1 ? "0" : "1"} />
                <button className="text-[11px] font-extrabold text-tech-600">{s.active === 1 ? "Deactivate" : "Activate"}</button>
              </form>
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-400">{d.search.noResults}</p>}
      </div>
    </div>
  );
}
