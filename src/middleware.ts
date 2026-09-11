import { isTrustedOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/") && pathname !== "/api/setup" &&
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      !isTrustedOrigin(req, process.env.NEXT_PUBLIC_SITE_URL)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  // Default language is Persian (/fa). Every page lives under /fa or /en.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/fa", req.url));
  }
  // Expose locale to the root layout via request headers (for <html lang/dir>).
  const locale = pathname.startsWith("/en") ? "en" : pathname.startsWith("/fa") ? "fa" : null;
  if (!locale) return NextResponse.next();
  const headers = new Headers(req.headers);
  headers.set("x-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/api/:path*", "/", "/fa/:path*", "/en/:path*"],
};
