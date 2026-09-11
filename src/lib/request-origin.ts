export function isTrustedOrigin(req: Request, publicUrl?: string): boolean {
  const origin = req.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    const allowed = new Set([new URL(req.url).origin]);
    if (publicUrl) allowed.add(new URL(publicUrl).origin);
    return allowed.has(origin);
  } catch { return false; }
}
