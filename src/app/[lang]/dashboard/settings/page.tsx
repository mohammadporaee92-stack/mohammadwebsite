import { notFound, redirect } from "next/navigation";
import { isLang, type Lang, pick, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Devices, Notifs } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateProfile, logoutAllDevices, markNotificationsRead, changePassword } from "../actions";

export default async function DashboardSettings({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ pw?: string }>;
}) {
  const { lang: raw } = await params;
  const sp = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/auth/login`);

  const devices = Devices.listByUser(user.id);
  const notifs = Notifs.listByUser(user.id, 10);

  return (
    <div className="space-y-5">
      {/* profile */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <h2 className="font-extrabold text-navy-900 mb-4">{d.dashboard.profile}</h2>
        <form action={updateProfile} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="s-name" className="block text-sm font-bold text-navy-900 mb-1.5">{d.dashboard.name}</label>
            <input id="s-name" name="name" defaultValue={user.name || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tech-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy-900 mb-1.5">{d.dashboard.phone}</label>
            <input value={user.phone} disabled dir="ltr" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label htmlFor="s-email" className="block text-sm font-bold text-navy-900 mb-1.5">{d.dashboard.email}</label>
            <input id="s-email" name="email" type="email" defaultValue={user.email || ""} dir="ltr" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tech-500" />
          </div>
          <div>
            <label htmlFor="s-lang" className="block text-sm font-bold text-navy-900 mb-1.5">{d.dashboard.language}</label>
            <select id="s-lang" name="preferredLang" defaultValue={user.preferredLang} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" name="notifyEmail" defaultChecked={user.notifyEmail} className="w-4 h-4 accent-blue-600" />
            {lang === "fa" ? "اعلان ایمیلی" : "Email notifications"}
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" name="notifySms" defaultChecked={user.notifySms} className="w-4 h-4 accent-blue-600" />
            {lang === "fa" ? "اعلان پیامکی" : "SMS notifications"}
          </label>
          <div className="sm:col-span-2">
            <button className="px-6 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
              {d.dashboard.save}
            </button>
          </div>
        </form>
      </section>

      {/* change password */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <h2 className="font-extrabold text-navy-900 mb-4">🔑 {d.dashboard.changePassword}</h2>
        {sp.pw === "changed" && (
          <p className="mb-3 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">{d.dashboard.passwordChanged}</p>
        )}
        {sp.pw === "wrong" && (
          <p className="mb-3 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{d.auth.errors.wrong_password}</p>
        )}
        {sp.pw === "weak" && (
          <p className="mb-3 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{d.auth.errors.weak_password}</p>
        )}
        <form action={changePassword} className="grid sm:grid-cols-3 gap-3 items-end">
          <input type="hidden" name="lang" value={lang} />
          {user.passwordHash && (
            <div>
              <label htmlFor="pw-cur" className="block text-sm font-bold text-navy-900 mb-1.5">{d.dashboard.currentPassword}</label>
              <input id="pw-cur" name="current" type="password" dir="ltr" autoComplete="current-password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tech-500" />
            </div>
          )}
          <div>
            <label htmlFor="pw-new" className="block text-sm font-bold text-navy-900 mb-1.5">{d.dashboard.newPassword}</label>
            <input id="pw-new" name="next" type="password" dir="ltr" autoComplete="new-password" required minLength={6} placeholder={d.auth.passwordPlaceholder} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tech-500" />
          </div>
          <div>
            <button className="px-6 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold hover:bg-navy-700 transition">
              {d.dashboard.changePassword}
            </button>
          </div>
        </form>
      </section>

      {/* devices */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-navy-900">{d.dashboard.devices} ({devices.length})</h2>
          <form action={logoutAllDevices}>
            <button className="text-xs font-extrabold text-rose-500 hover:text-rose-600">{d.dashboard.logoutAll}</button>
          </form>
        </div>
        <ul className="space-y-2 text-sm">
          {devices.map((x) => (
            <li key={x.id as string} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
              <span className="font-semibold text-slate-600 truncate max-w-[70%]">💻 {(x.label as string) || "Web"}</span>
              <span className="text-[11px] text-slate-400">{fmtDate(x.lastSeenAt as string, lang)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* notifications */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-navy-900">{d.dashboard.notifications}</h2>
          <form action={markNotificationsRead}>
            <button className="text-xs font-extrabold text-tech-600">{lang === "fa" ? "علامت به‌عنوان خوانده‌شده" : "Mark all read"}</button>
          </form>
        </div>
        {notifs.length > 0 ? (
          <ul className="space-y-2">
            {notifs.map((n) => (
              <li key={n.id as string} className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                <p className="font-bold text-navy-900">{pick(n as unknown as Record<string, unknown>, "title", lang)}</p>
                {Boolean(n.bodyFa || n.bodyEn) && <p className="text-slate-500 text-xs mt-0.5">{pick(n as unknown as Record<string, unknown>, "body", lang)}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">{d.dashboard.noNotifications}</p>
        )}
      </section>
    </div>
  );
}
