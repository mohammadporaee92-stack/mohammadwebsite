import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/lib/i18n";
import { getDict } from "@/lib/dict";
import { Settings } from "@/lib/db";
import { SETTING_DEFS } from "@/lib/settings";
import { saveSettings } from "../actions";
import { UploadField } from "@/components/forms";

const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-500";

export default async function AdminSettings({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = getDict(lang);
  const keys = SETTING_DEFS.map((x) => x.key);
  const values = Settings.many(keys);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-navy-900">{d.admin.settings}</h1>
      <form action={saveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-5 grid md:grid-cols-2 gap-4">
        <input type="hidden" name="lang" value={lang} />
        {SETTING_DEFS.map((def) => {
          const label = lang === "fa" ? def.labelFa : def.labelEn;
          if (def.key === "profile_image") {
            return (
              <div key={def.key} className="md:col-span-2">
                <UploadField name={def.key} label={label} initial={values[def.key] || ""} />
              </div>
            );
          }
          const isTextarea = "textarea" in def && def.textarea;
          const isLtr = ["instagram", "linkedin", "youtube", "telegram", "contact_email", "default_lang"].includes(def.key);
          return (
            <div key={def.key} className={isTextarea ? "md:col-span-2" : ""}>
              <label className="block text-xs font-extrabold text-navy-900 mb-1">{label} <span className="text-slate-400 font-mono" dir="ltr">{def.key}</span></label>
              {isTextarea ? (
                <textarea name={def.key} rows={3} defaultValue={values[def.key] || ""} className={inputCls} />
              ) : (
                <input name={def.key} defaultValue={values[def.key] || ""} dir={isLtr ? "ltr" : "auto"} className={inputCls} />
              )}
            </div>
          );
        })}
        <div className="md:col-span-2">
          <button className="px-8 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-extrabold">Save settings</button>
        </div>
      </form>
    </div>
  );
}
