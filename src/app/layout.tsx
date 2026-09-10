import type { Metadata } from "next";
import { headers } from "next/headers";
// Self-hosted fonts (no Google Fonts dependency — Iran-friendly, zero external requests)
import "@fontsource-variable/inter";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import { siteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
};

const FA_STACK = "'Vazirmatn Variable', 'Inter Variable', system-ui, Tahoma, sans-serif";
const EN_STACK = "'Inter Variable', system-ui, -apple-system, sans-serif";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const locale = h.get("x-locale") === "en" ? "en" : "fa";
  const dir = locale === "fa" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body
        className="min-h-screen flex flex-col"
        style={{ fontFamily: locale === "fa" ? FA_STACK : EN_STACK }}
      >
        {children}
      </body>
    </html>
  );
}
