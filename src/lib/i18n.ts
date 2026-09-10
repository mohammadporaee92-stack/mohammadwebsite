export type Lang = "fa" | "en";

export const LANGS: Lang[] = ["fa", "en"];

export function isLang(v: unknown): v is Lang {
  return v === "fa" || v === "en";
}

export function otherLang(l: Lang): Lang {
  return l === "fa" ? "en" : "fa";
}

export function dirOf(l: Lang) {
  return l === "fa" ? "rtl" : "ltr";
}

/** Pick a localized DB field: pick(article, "title", lang) */
export function pick(obj: object, base: string, lang: Lang): string {
  const r = obj as Record<string, unknown>;
  const v = r[`${base}${lang === "fa" ? "Fa" : "En"}`];
  if (typeof v === "string" && v.length > 0) return v;
  const fallback = r[`${base}${lang === "fa" ? "En" : "Fa"}`];
  return typeof fallback === "string" ? fallback : "";
}

export function toFaDigits(s: string | number): string {
  return String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function fmtNum(n: number, lang: Lang): string {
  const s = n.toLocaleString("en-US");
  return lang === "fa" ? toFaDigits(s) : s;
}

export function fmtDate(d: Date | string, lang: Lang): string {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
