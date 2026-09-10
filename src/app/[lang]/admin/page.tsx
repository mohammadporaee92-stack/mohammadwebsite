import Link from "next/link";
import { notFound } from "next/navigation";
import { isLang, type Lang, pick, fmtNum, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Users, Articles, Courses, Enroll, Subs, Inquiries, Messages, Activity } from "@/lib/db";

export default async function AdminHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const stats = [
    { label: d.admin.totalUsers, value: Users.count(), icon: "👥" },
    { label: d.admin.newUsers, value: Users.countSince(weekAgo), icon: "🆕" },
    { label: d.admin.enrollments, value: Enroll.count(), icon: "🎓" },
    { label: `${d.admin.published} (${d.nav.learn}/${d.nav.blog})`, value: Articles.count({ status: "published" }), icon: "📝" },
    { label: `${d.admin.published} (${d.nav.courses})`, value: Courses.count({ status: "published" }), icon: "📚" },
    { label: d.admin.newsletter, value: Subs.count(), icon: "✉️" },
    { label: d.admin.inquiries, value: Inquiries.count(), icon: "📥" },
    { label: d.admin.messages, value: Messages.count(), icon: "💬" },
  ];
  const popular = Articles.list({ status: "published", orderBy: "popular", limit: 5 });
  const recentUsers = Users.list({ limit: 5 });
  const activity = Activity.recent(12);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-navy-900">{d.admin.overview}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-1 text-2xl font-extrabold text-navy-900">{fmtNum(s.value, lang)}</p>
            <p className="text-xs text-slate-500 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-navy-900 text-sm">💾 {lang === "fa" ? "بکاپ دیتابیس" : "Database backup"}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "fa"
              ? "دانلود فایل دیتابیس (کاربران، محتواها، ثبت‌نام‌ها). هر از گاهی یک نسخه نگه دارید."
              : "Download the database file (users, content, enrollments). Keep a copy from time to time."}
          </p>
        </div>
        <a
          href="/api/admin/backup"
          download
          className="rounded-xl bg-navy-900 text-white text-sm font-bold px-4 py-2.5 hover:bg-navy-800 transition"
        >
          ⬇️ {lang === "fa" ? "دانلود بکاپ" : "Download backup"}
        </a>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <h2 className="font-extrabold text-navy-900 text-sm mb-3">🔥 {d.admin.popular}</h2>
          <ul className="space-y-2">
            {popular.map((a) => (
              <li key={a.id}>
                <Link href={`/${lang}/admin/articles/${a.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-tech-600 transition">
                  <span className="font-semibold truncate">{pick(a, "title", lang)}</span>
                  <span className="text-xs text-slate-400 shrink-0">{fmtNum(a.views, lang)} 👁</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <h2 className="font-extrabold text-navy-900 text-sm mb-3">🆕 {d.admin.newUsers}</h2>
          <ul className="space-y-2">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold" dir="ltr">{u.phone}</span>
                <span className="text-xs text-slate-400">{fmtDate(u.createdAt, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/80 p-5">
        <h2 className="font-extrabold text-navy-900 text-sm mb-3">🧾 {d.admin.activity}</h2>
        <ul className="space-y-1.5 text-xs">
          {activity.map((a) => (
            <li key={a.id as string} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="font-mono font-bold text-slate-600" dir="ltr">{a.action as string} {(a.detail as string) || ""}</span>
              <span className="text-slate-400 shrink-0">{fmtDate(a.createdAt as string, lang)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
