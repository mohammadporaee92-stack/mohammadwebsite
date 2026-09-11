import { Settings } from "./db";
import { BRAND_DEFAULTS } from "./brand";

const cache = new Map<string, string>();
let cacheAt = 0;
const CACHE_TTL = 30_000;

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const now = Date.now();
  if (now - cacheAt > CACHE_TTL) {
    cache.clear();
    cacheAt = now;
  }
  if (cache.has(key)) return cache.get(key)!;
  const value = Settings.get(key) ?? BRAND_DEFAULTS[key] ?? fallback;
  cache.set(key, value);
  return value;
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = Settings.get(k) ?? BRAND_DEFAULTS[k] ?? "";
  return out;
}

export async function setSetting(key: string, value: string) {
  cache.set(key, value);
  Settings.set(key, value);
}

export const SETTING_DEFS = [
  { key: "site_name_fa", labelFa: "نام سایت (فارسی)", labelEn: "Site name (FA)" },
  { key: "site_name_en", labelFa: "نام سایت (انگلیسی)", labelEn: "Site name (EN)" },
  { key: "tagline_fa", labelFa: "شعار (فارسی)", labelEn: "Tagline (FA)" },
  { key: "tagline_en", labelFa: "شعار (انگلیسی)", labelEn: "Tagline (EN)" },
  { key: "bio_fa", labelFa: "بیوگرافی (فارسی)", labelEn: "Bio (FA)", textarea: true },
  { key: "bio_en", labelFa: "بیوگرافی (انگلیسی)", labelEn: "Bio (EN)", textarea: true },
  { key: "profile_image", labelFa: "عکس پروفایل (آدرس فایل)", labelEn: "Profile image (URL)" },
  { key: "instagram", labelFa: "آیدی اینستاگرام (بدون @)", labelEn: "Instagram (no @)" },
  { key: "linkedin", labelFa: "لینک لینکدین", labelEn: "LinkedIn URL" },
  { key: "youtube", labelFa: "لینک یوتیوب", labelEn: "YouTube URL" },
  { key: "telegram", labelFa: "لینک تلگرام", labelEn: "Telegram URL" },
  { key: "contact_email", labelFa: "ایمیل تماس", labelEn: "Contact email" },
  { key: "default_lang", labelFa: "زبان پیش‌فرض (fa/en)", labelEn: "Default lang (fa/en)" },
  { key: "seo_title_fa", labelFa: "عنوان سئو خانه (فارسی)", labelEn: "Home SEO title (FA)" },
  { key: "seo_title_en", labelFa: "عنوان سئو خانه (انگلیسی)", labelEn: "Home SEO title (EN)" },
  { key: "seo_desc_fa", labelFa: "توضیح سئو خانه (فارسی)", labelEn: "Home SEO desc (FA)", textarea: true },
  { key: "seo_desc_en", labelFa: "توضیح سئو خانه (انگلیسی)", labelEn: "Home SEO desc (EN)", textarea: true },
] as const;
