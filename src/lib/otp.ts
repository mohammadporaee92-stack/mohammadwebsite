import { createHash, randomInt } from "crypto";
import { Otps } from "./db";
import { getSmsProvider, isDemoSms } from "./sms";

export const OTP_TTL_MINUTES = 5;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_PER_PHONE_PER_HOUR = 5;
export const OTP_MAX_PER_IP_PER_HOUR = 20;

export function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function requestOtp(phone: string, ip?: string | null) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  const phoneCount = Otps.countPhoneSince(phone, oneHourAgo);
  const ipCount = ip ? Otps.countIpSince(ip, oneHourAgo) : 0;
  const lastForPhone = Otps.lastForPhone(phone);

  if (phoneCount >= OTP_MAX_PER_PHONE_PER_HOUR) {
    return { ok: false as const, error: "rate_limited" as const, retryAfter: 3600 };
  }
  if (ipCount >= OTP_MAX_PER_IP_PER_HOUR) {
    return { ok: false as const, error: "rate_limited" as const, retryAfter: 3600 };
  }
  if (lastForPhone) {
    const elapsed = (now.getTime() - new Date(lastForPhone.createdAt).getTime()) / 1000;
    if (elapsed < OTP_RESEND_SECONDS) {
      return {
        ok: false as const,
        error: "cooldown" as const,
        retryAfter: Math.ceil(OTP_RESEND_SECONDS - elapsed),
      };
    }
  }

  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  // Invalidate previous unconsumed codes for this phone
  Otps.invalidatePhone(phone);
  Otps.create({ phone, codeHash: hashCode(code), expiresAt, ip: ip || null });

  const sms = getSmsProvider();
  const sent = await sms.sendOtp(phone, code);
  if (!sent.ok) {
    return { ok: false as const, error: "sms_failed" as const, detail: sent.error };
  }

  return {
    ok: true as const,
    // Only exposed in demo mode so the owner can test for free.
    demoCode: isDemoSms() ? code : undefined,
    expiresIn: OTP_TTL_MINUTES * 60,
  };
}

export async function verifyOtp(phone: string, code: string) {
  const record = Otps.latestActive(phone);
  if (!record) return { ok: false as const, error: "not_found" as const };
  if (new Date(record.expiresAt) < new Date()) {
    Otps.consume(record.id);
    return { ok: false as const, error: "expired" as const };
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    Otps.consume(record.id);
    return { ok: false as const, error: "locked" as const };
  }
  if (record.codeHash !== hashCode(code.trim())) {
    Otps.bumpAttempts(record.id);
    return {
      ok: false as const,
      error: "wrong_code" as const,
      attemptsLeft: OTP_MAX_ATTEMPTS - record.attempts - 1,
    };
  }
  Otps.consume(record.id);
  return { ok: true as const };
}
