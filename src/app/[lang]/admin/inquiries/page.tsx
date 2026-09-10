import { notFound } from "next/navigation";
import { isLang, type Lang, fmtDate } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Inquiries, Messages } from "@/lib/db";
import { setInquiryStatus, setMessageStatus } from "../actions";
import { cx } from "@/lib/utils";

export default async function AdminInquiries({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);

  const inquiries = Inquiries.list({ limit: 100 });
  const messages = Messages.list(100);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-extrabold text-navy-900 mb-3">{d.admin.inquiries} ({inquiries.length})</h1>
        <div className="space-y-3">
          {inquiries.map((q) => (
            <details key={q.id as string} className="bg-white rounded-2xl border border-slate-200/80 p-4">
              <summary className="flex flex-wrap items-center gap-2 cursor-pointer list-none">
                <span className={cx("text-[11px] font-extrabold px-2 py-0.5 rounded-full",
                  q.status === "new" ? "bg-emerald-100 text-emerald-700" : q.status === "contacted" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
                  {q.status as string}
                </span>
                <strong className="text-sm">{q.name as string}</strong>
                <span className="text-xs text-slate-400">{(q.projectType as string) || "—"} {(q.unsure ? "· 🤔 unsure" : "")}</span>
                <span className="ms-auto text-[11px] text-slate-400">{fmtDate(q.createdAt as string, lang)}</span>
              </summary>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
                {([["company", q.company], ["email", q.email], ["phone", q.phone], ["country", q.country], ["budget", q.budget]] as const).map(([k, v]) => (
                  <p key={k} className="bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-400 font-bold">{k}: </span><span className="font-semibold">{(v as string) || "—"}</span></p>
                ))}
                <p className="sm:col-span-2 bg-slate-50 rounded-lg px-3 py-2 whitespace-pre-line">{q.message as string}</p>
              </div>
              <form action={setInquiryStatus} className="mt-3 flex gap-2">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={q.id as string} />
                <select name="status" defaultValue={q.status as string} className="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200">
                  <option value="new">new</option><option value="contacted">contacted</option><option value="closed">closed</option>
                </select>
                <button className="text-xs font-extrabold text-tech-600">✓ Save</button>
              </form>
            </details>
          ))}
          {inquiries.length === 0 && <p className="text-sm text-slate-400">—</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-navy-900 mb-3">{d.admin.messages} ({messages.length})</h2>
        <div className="space-y-3">
          {messages.map((m) => (
            <details key={m.id as string} className="bg-white rounded-2xl border border-slate-200/80 p-4">
              <summary className="flex flex-wrap items-center gap-2 cursor-pointer list-none">
                <span className={cx("text-[11px] font-extrabold px-2 py-0.5 rounded-full",
                  m.status === "new" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                  {m.status as string}
                </span>
                <strong className="text-sm">{m.name as string}</strong>
                <span className="text-xs text-slate-400" dir="ltr">{m.email as string}</span>
                <span className="ms-auto text-[11px] text-slate-400">{fmtDate(m.createdAt as string, lang)}</span>
              </summary>
              <p className="mt-2 text-sm font-bold">{(m.subject as string) || ""}</p>
              <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{m.message as string}</p>
              <form action={setMessageStatus} className="mt-3 flex gap-2">
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="id" value={m.id as string} />
                <select name="status" defaultValue={m.status as string} className="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200">
                  <option value="new">new</option><option value="contacted">contacted</option><option value="closed">closed</option>
                </select>
                <button className="text-xs font-extrabold text-tech-600">✓ Save</button>
              </form>
            </details>
          ))}
          {messages.length === 0 && <p className="text-sm text-slate-400">—</p>}
        </div>
      </section>
    </div>
  );
}
