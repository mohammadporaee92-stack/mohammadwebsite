"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { otherLang } from "@/lib/i18n";

// ---------- language switch (keeps same page) ----------

export function LangSwitch({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const other = otherLang(lang);
  const target = pathname ? pathname.replace(/^\/(fa|en)/, `/${other}`) : `/${other}`;
  return (
    <Link
      href={target}
      className="px-3 py-1.5 rounded-lg text-xs font-extrabold border border-white/25 text-white hover:bg-white/10 transition tracking-widest"
      aria-label={other === "fa" ? "نسخه فارسی" : "English version"}
    >
      {other === "fa" ? "فا" : "EN"}
    </Link>
  );
}

// ---------- search button -> search page ----------

export function SearchButton({ lang, label }: { lang: Lang; label: string }) {
  return (
    <Link href={`/${lang}/search`} aria-label={label}
      className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition">
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    </Link>
  );
}

// ---------- mobile menu ----------

export function MobileMenu(props: {
  lang: Lang;
  links: Array<{ href: string; label: string }>;
  loginLabel: string; dashboardLabel: string; adminLabel: string; logoutLabel: string;
  loggedIn: boolean; userName: string; isStaff: boolean; instagram: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.refresh();
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="menu" aria-expanded={open}
        className="p-2 rounded-lg text-white hover:bg-white/10 transition">
        {open ? (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        )}
      </button>
      {open && (
        <div className="absolute end-0 top-12 w-64 rounded-2xl bg-navy-900 border border-white/10 shadow-2xl p-3 space-y-1 max-h-[70vh] overflow-auto">
          {props.links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
            {props.loggedIn ? (
              <>
                {props.isStaff && (
                  <Link href={`/${props.lang}/admin`} onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-amber-300 hover:bg-white/10 transition">{props.adminLabel}</Link>
                )}
                <Link href={`/${props.lang}/dashboard`} onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-white/10">{props.dashboardLabel}{props.userName ? ` (${props.userName})` : ""}</Link>
                <button onClick={logout} className="w-full text-start px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition">{props.logoutLabel}</button>
              </>
            ) : (
              <Link href={`/${props.lang}/auth/login`} onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-tech-500 text-center">{props.loginLabel}</Link>
            )}
            <a href={`https://instagram.com/${props.instagram}`} target="_blank" rel="noopener"
              className="block px-3 py-2.5 rounded-xl text-sm text-sky-glow" dir="ltr">Instagram · @{props.instagram}</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- newsletter ----------

export function NewsletterForm({ lang, placeholder, button, done }: { lang: Lang; placeholder: string; button: string; done: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }
  if (state === "done") {
    return (
      <p className="flex items-center justify-center gap-2 text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-4 py-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m5 13 4 4L19 7" /></svg>
        {done}
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
      <label htmlFor="nl-email" className="sr-only">{placeholder}</label>
      <input id="nl-email" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder} className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-glow" />
      <button disabled={state === "loading"} className="px-6 py-3 rounded-xl bg-white text-navy-900 font-extrabold hover:bg-blue-50 transition disabled:opacity-60">
        {state === "loading" ? "…" : button}
      </button>
    </form>
  );
}

// ---------- bookmark toggle ----------

export function BookmarkButton({ targetType, targetId, initial, labels }: {
  targetType: string; targetId: string; initial: boolean;
  labels: { save: string; saved: string; login: string };
}) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (res.status === 401) {
        alert(labels.login);
        return;
      }
      if (res.ok) {
        const j = await res.json();
        setOn(j.bookmarked);
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <button onClick={toggle} aria-label={on ? labels.saved : labels.save} title={on ? labels.saved : labels.save}
      className={`p-2 rounded-lg transition shrink-0 ${on ? "text-tech-600 bg-blue-50" : "text-slate-300 hover:text-tech-600 hover:bg-blue-50"}`}>
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ---------- enroll button ----------

export function EnrollButton({ courseSlug, labels }: {
  courseSlug: string;
  labels: { enroll: string; enrolled: string; login: string };
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const router = useRouter();
  async function enroll() {
    setState("loading");
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug }),
    });
    if (res.status === 401) {
      alert(labels.login);
      setState("idle");
      return;
    }
    if (res.ok) {
      setState("done");
      router.refresh();
    } else {
      setState("idle");
    }
  }
  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-extrabold">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m5 13 4 4L19 7" /></svg>
        {labels.enrolled}
      </span>
    );
  }
  return (
    <button onClick={enroll} disabled={state === "loading"}
      className="px-6 py-3 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-extrabold shadow-lg shadow-blue-900/30 hover:brightness-110 transition disabled:opacity-60">
      {state === "loading" ? "…" : labels.enroll}
    </button>
  );
}

// ---------- lesson complete toggle ----------

export function LessonCompleteButton({ lessonId, initial, labels }: {
  lessonId: string; initial: boolean; labels: { mark: string; done: string };
}) {
  const [doneState, setDone] = useState(initial);
  async function toggle() {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, done: !doneState }),
    });
    if (res.ok) setDone(!doneState);
  }
  return (
    <button onClick={toggle}
      className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition ${doneState ? "bg-emerald-100 text-emerald-700" : "bg-navy-900 text-white hover:bg-navy-700"}`}>
      {doneState ? `✓ ${labels.done}` : labels.mark}
    </button>
  );
}

// ---------- password auth forms ----------

const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tech-500 bg-white";
const submitCls = "w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-extrabold shadow-lg shadow-blue-900/20 hover:brightness-110 transition disabled:opacity-60";

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{message}</p>;
}

function DemoCodeBox({ code, title, hint }: { code: string; title: string; hint: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-center">
      <p className="text-xs font-bold text-amber-700">{title}</p>
      <p className="text-2xl font-extrabold tracking-[0.4em] text-navy-900 mt-1" dir="ltr">{code}</p>
      <p className="text-[11px] text-amber-600 mt-1">{hint}</p>
    </div>
  );
}

export function PasswordLoginForm({ lang, dict }: {
  lang: Lang;
  dict: {
    phoneLabel: string; phonePlaceholder: string; passwordLabel: string; passwordPlaceholder: string;
    loginButton: string; forgotLink: string; errors: Record<string, string>;
  };
}) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(dict.errors[j.error] || dict.errors.wrong_password);
        return;
      }
      router.push(j.isStaff ? `/${lang}/admin` : `/${lang}/dashboard`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="li-phone" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.phoneLabel}</label>
        <input id="li-phone" inputMode="tel" dir="ltr" autoComplete="username" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder={dict.phonePlaceholder} required
          className={`${inputCls} text-left tracking-widest font-bold`} />
      </div>
      <div>
        <label htmlFor="li-pass" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.passwordLabel}</label>
        <div className="relative">
          <input id="li-pass" type={show ? "text" : "password"} dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={dict.passwordPlaceholder} required
            className={`${inputCls} text-left pe-12`} />
          <button type="button" onClick={() => setShow(!show)} aria-label="show password"
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900 text-lg">
            {show ? "🙈" : "👁"}
          </button>
        </div>
      </div>
      <FormError message={error} />
      <button disabled={loading || !phone || !password} className={submitCls}>
        {loading ? "…" : dict.loginButton}
      </button>
      <p className="text-center text-sm">
        <Link href={`/${lang}/auth/forgot`} className="font-bold text-tech-600 hover:text-tech-500">{dict.forgotLink}</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ lang, dict }: {
  lang: Lang;
  dict: {
    nameLabel: string; phoneLabel: string; phonePlaceholder: string; passwordLabel: string; passwordPlaceholder: string;
    registerButton: string; errors: Record<string, string>;
  };
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, lang }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(dict.errors[j.error] || dict.errors.invalid_phone);
        return;
      }
      router.push(j.isStaff ? `/${lang}/admin` : `/${lang}/dashboard`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="rg-name" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.nameLabel}</label>
        <input id="rg-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
          required minLength={2} maxLength={80} className={inputCls} />
      </div>
      <div>
        <label htmlFor="rg-phone" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.phoneLabel}</label>
        <input id="rg-phone" inputMode="tel" dir="ltr" autoComplete="username" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder={dict.phonePlaceholder} required
          className={`${inputCls} text-left tracking-widest font-bold`} />
      </div>
      <div>
        <label htmlFor="rg-pass" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.passwordLabel}</label>
        <div className="relative">
          <input id="rg-pass" type={show ? "text" : "password"} dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={dict.passwordPlaceholder} required minLength={6}
            className={`${inputCls} text-left pe-12`} />
          <button type="button" onClick={() => setShow(!show)} aria-label="show password"
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-900 text-lg">
            {show ? "🙈" : "👁"}
          </button>
        </div>
      </div>
      <FormError message={error} />
      <button disabled={loading || !name || !phone || password.length < 6} className={submitCls}>
        {loading ? "…" : dict.registerButton}
      </button>
    </form>
  );
}

export function ForgotPasswordForm({ lang, dict }: {
  lang: Lang;
  dict: {
    phoneLabel: string; phonePlaceholder: string; sendCode: string; codeLabel: string;
    newPasswordLabel: string; passwordPlaceholder: string; resetButton: string; resetDone: string;
    backToLogin: string; resend: string; backToPhone: string; demoBox: string; demoHint: string;
    errors: Record<string, string>;
  };
}) {
  const [step, setStep] = useState<"phone" | "code" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function tick(sec: number) {
    setCooldown(sec);
    if (sec <= 0) return;
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function requestCode() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(dict.errors[j.error] || dict.errors.invalid_phone);
        if (j.retryAfter) tick(j.retryAfter);
        return;
      }
      setDemoCode(j.demoCode || null);
      setStep("code");
      tick(60);
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(dict.errors[j.error] || dict.errors.wrong_code);
        return;
      }
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="space-y-5 text-center">
        <p className="flex items-center justify-center gap-2 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m5 13 4 4L19 7" /></svg>
          {dict.resetDone}
        </p>
        <Link href={`/${lang}/auth/login`} className="inline-block px-8 py-3 rounded-xl bg-navy-900 text-white font-extrabold hover:bg-navy-700 transition">
          {dict.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {step === "phone" ? (
        <>
          <div>
            <label htmlFor="fp-phone" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.phoneLabel}</label>
            <input id="fp-phone" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder={dict.phonePlaceholder}
              className={`${inputCls} text-left tracking-widest font-bold`} />
          </div>
          <FormError message={error} />
          <button onClick={requestCode} disabled={loading || !phone} className={submitCls}>
            {loading ? "…" : dict.sendCode}
          </button>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="fp-code" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.codeLabel}</label>
            <input id="fp-code" inputMode="numeric" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className={`${inputCls} text-center tracking-[0.5em] text-xl font-extrabold`} />
          </div>
          {demoCode && <DemoCodeBox code={demoCode} title={dict.demoBox} hint={dict.demoHint} />}
          <div>
            <label htmlFor="fp-pass" className="block text-sm font-bold text-navy-900 mb-1.5">{dict.newPasswordLabel}</label>
            <input id="fp-pass" type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={dict.passwordPlaceholder}
              className={`${inputCls} text-left`} />
          </div>
          <FormError message={error} />
          <button onClick={reset} disabled={loading || code.length !== 6 || password.length < 6} className={submitCls}>
            {loading ? "…" : dict.resetButton}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button onClick={() => setStep("phone")} className="font-bold text-slate-500 hover:text-navy-900 transition">{dict.backToPhone}</button>
            <button onClick={requestCode} disabled={cooldown > 0 || loading} className="font-bold text-tech-600 hover:text-tech-500 transition disabled:opacity-50">
              {cooldown > 0 ? `${dict.resend} (${cooldown})` : dict.resend}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- generic lead/contact form ----------

export function LeadForm({ endpoint, fields, sendLabel, doneMessage, extra }: {
  endpoint: string;
  fields: Array<{ name: string; label: string; type?: string; required?: boolean; options?: string[]; full?: boolean; textarea?: boolean; placeholder?: string }>;
  sendLabel: string; doneMessage: string;
  extra?: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    fd.forEach((v, k) => { body[k] = v; });
    // checkbox handling
    const form = e.currentTarget;
    form.querySelectorAll('input[type="checkbox"]').forEach((el) => {
      body[(el as HTMLInputElement).name] = (el as HTMLInputElement).checked;
    });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }
  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m5 13 4 4L19 7" /></svg>
        {doneMessage}
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
          <label htmlFor={`lf-${f.name}`} className="block text-sm font-bold text-navy-900 mb-1.5">
            {f.label}{f.required ? " *" : ""}
          </label>
          {f.options ? (
            <select id={`lf-${f.name}`} name={f.name} required={f.required}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-tech-500">
              <option value="">—</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.textarea ? (
            <textarea id={`lf-${f.name}`} name={f.name} required={f.required} rows={5} placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-tech-500" />
          ) : f.type === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-pointer">
              <input type="checkbox" name={f.name} className="w-4 h-4 accent-blue-600" /> {f.label}
            </label>
          ) : (
            <input id={`lf-${f.name}`} name={f.name} type={f.type || "text"} required={f.required} placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-tech-500" />
          )}
        </div>
      ))}
      {extra}
      {state === "error" && <p className="sm:col-span-2 text-sm font-bold text-rose-600">Error. Please try again.</p>}
      <div className="sm:col-span-2">
        <button disabled={state === "loading"}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-tech-500 to-blue-600 text-white font-extrabold shadow-lg shadow-blue-900/20 hover:brightness-110 transition disabled:opacity-60">
          {state === "loading" ? "…" : sendLabel}
        </button>
      </div>
    </form>
  );
}

// ---------- admin file upload (local storage, S3-ready later) ----------

export function UploadField({ name, label, initial }: { name: string; label: string; initial?: string }) {
  const [url, setUrl] = useState(initial || "");
  const [busy, setBusy] = useState(false);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (res.ok) setUrl(j.url);
      else alert(j.error || "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <label className="block text-sm font-bold text-navy-900 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr"
          placeholder="/uploads/..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm" />
        <label className="px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-bold cursor-pointer hover:bg-navy-700 transition">
          {busy ? "…" : "↑"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 h-20 rounded-lg object-cover border" />
      )}
    </div>
  );
}
