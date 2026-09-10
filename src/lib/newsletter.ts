// Newsletter abstraction: subscribers are always stored in the local DB.
// When the owner picks an email provider (Resend/Mailchimp...), sync here.

import { Subs } from "./db";

export async function subscribeEmail(email: string, lang: string) {
  const clean = email.trim().toLowerCase();
  const r = Subs.subscribe(clean, lang);
  // TODO(owner): forward to NEWSLETTER_PROVIDER when configured.
  return { ok: true as const, duplicate: r.duplicate };
}
