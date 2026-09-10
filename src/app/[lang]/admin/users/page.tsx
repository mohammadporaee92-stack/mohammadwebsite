import { notFound } from "next/navigation";
import { isLang, type Lang, fmtNum, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Users, all } from "@/lib/db";
import { setUserRole, setUserStatus } from "../actions";
import { cx } from "@/lib/utils";

export default async function AdminUsers({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}) {
  const { lang: raw } = await params;
  const sp = await searchParams;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const list = Users.list({ search: sp.q || undefined, role: sp.role || undefined, status: sp.status || undefined, limit: 100 });
  const enrollCounts = new Map(
    all<{ userId: string; n: number }>("SELECT userId, COUNT(*) as n FROM enrollments GROUP BY userId").map((r) => [r.userId, r.n])
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-navy-900">{d.admin.users} ({fmtNum(Users.count(), lang)})</h1>

      <form className="flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={sp.q || ""} placeholder={lang === "fa" ? "جستجو: موبایل، نام، ایمیل" : "Search phone, name, email"}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white min-w-52" />
        <select name="role" defaultValue={sp.role || ""} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">role: all</option>
          {["super_admin", "admin", "editor", "instructor", "user"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select name="status" defaultValue={sp.status || ""} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
          <option value="">status: all</option>
          <option value="active">active</option>
          <option value="disabled">disabled</option>
        </select>
        <button className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-bold">{d.search.button}</button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-start text-xs text-slate-400 border-b border-slate-100">
              <th className="text-start font-bold px-4 py-3">User</th>
              <th className="text-start font-bold px-4 py-3">Courses</th>
              <th className="text-start font-bold px-4 py-3">Role</th>
              <th className="text-start font-bold px-4 py-3">Status</th>
              <th className="text-start font-bold px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {list.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2.5">
                  <p className="font-bold" dir="ltr">{u.phone}</p>
                  <p className="text-xs text-slate-400">{u.name || "—"} {u.email ? `· ${u.email}` : ""}</p>
                </td>
                <td className="px-4 py-2.5 font-bold">{fmtNum(enrollCounts.get(u.id) ?? 0, lang)}</td>
                <td className="px-4 py-2.5">
                  <form action={setUserRole} className="flex gap-1">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 bg-white">
                      {["super_admin", "admin", "editor", "instructor", "user"].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button className="text-xs font-extrabold text-tech-600">✓</button>
                  </form>
                </td>
                <td className="px-4 py-2.5">
                  <form action={setUserStatus} className="flex gap-1 items-center">
                    <input type="hidden" name="lang" value={lang} />
                    <input type="hidden" name="id" value={u.id} />
                    <span className={cx("text-[11px] font-extrabold px-2 py-0.5 rounded-full",
                      u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600")}>
                      {u.status}
                    </span>
                    <select name="status" defaultValue={u.status} className="text-xs px-1.5 py-1.5 rounded-lg border border-slate-200 bg-white">
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
                    </select>
                    <button className="text-xs font-extrabold text-tech-600">✓</button>
                  </form>
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-400">{fmtDate(u.createdAt, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm text-slate-400">{d.search.noResults}</p>}
      </div>
    </div>
  );
}
