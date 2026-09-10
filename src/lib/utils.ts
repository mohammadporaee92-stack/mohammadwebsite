export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  const base = siteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function clientIp(req: Request): string | null {
  const h = (name: string) => req.headers.get(name);
  const fwd = h("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h("x-real-ip");
}
