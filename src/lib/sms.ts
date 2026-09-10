// ============================================================
// SMS provider abstraction.
// The OTP flow calls `sendOtpSms(phone, code)` — the provider is
// selected via SMS_PROVIDER env. Add credentials in .env when ready.
// ============================================================

export interface SmsProvider {
  name: string;
  sendOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }>;
}

class DemoSmsProvider implements SmsProvider {
  name = "demo";
  async sendOtp(phone: string, code: string) {
    // Demo mode: no SMS is sent. The code is returned to the UI
    // (clearly labeled) so the owner can test without any cost.
    console.log(`[SMS:demo] OTP for ${phone}: ${code}`);
    return { ok: true };
  }
}

class KavenegarProvider implements SmsProvider {
  name = "kavenegar";
  async sendOtp(phone: string, code: string) {
    const apiKey = process.env.KAVENEGAR_API_KEY;
    const sender = process.env.KAVENEGAR_SENDER;
    if (!apiKey || !sender) {
      return { ok: false, error: "KAVENEGAR_API_KEY / KAVENEGAR_SENDER missing" };
    }
    try {
      const res = await fetch(
        `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            receptor: phone,
            token: code,
            template: "verify",
          }),
        }
      );
      if (!res.ok) return { ok: false, error: `Kavenegar HTTP ${res.status}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }
}

class GhasedakProvider implements SmsProvider {
  name = "ghasedak";
  async sendOtp(phone: string, code: string) {
    const apiKey = process.env.GHASEDAK_API_KEY;
    if (!apiKey) return { ok: false, error: "GHASEDAK_API_KEY missing" };
    // NOTE: connect the owner's Ghasedaksms / Meli Payamak panel here.
    // Kept as a stub until the owner provides credentials + template.
    return { ok: false, error: "Ghasedak provider not configured yet" };
  }
}

export function getSmsProvider(): SmsProvider {
  const p = (process.env.SMS_PROVIDER || "demo").toLowerCase();
  if (p === "kavenegar") return new KavenegarProvider();
  if (p === "ghasedak") return new GhasedakProvider();
  return new DemoSmsProvider();
}

export function isDemoSms() {
  return (process.env.SMS_PROVIDER || "demo").toLowerCase() === "demo";
}
