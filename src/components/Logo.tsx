import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { cx } from "@/lib/utils";

export default function Logo({ lang, dark = false }: { lang: Lang; dark?: boolean }) {
  return (
    <Link href={`/${lang}`} className="flex items-center gap-2.5 shrink-0" aria-label="PorAI home">
      <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-tech-500 via-blue-600 to-navy-800 shadow-lg shadow-blue-900/30">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 17c2.5 0 2.5-6 5-6s2.5 6 5 6 2.5-6 5-6" />
          <circle cx="19" cy="17" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={cx("block text-xl font-extrabold tracking-tight", dark ? "text-white" : "text-navy-900")}>
          Por<span className="text-transparent bg-clip-text bg-gradient-to-r from-tech-500 to-sky-glow">AI</span>
        </span>
        <span className={cx("block text-[10px] font-medium tracking-wide", dark ? "text-slate-300" : "text-slate-500")}>
          {lang === "fa" ? "محمد پورائی" : "Mohammad Pouraei"}
        </span>
      </span>
    </Link>
  );
}
