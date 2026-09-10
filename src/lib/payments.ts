// ============================================================
// Payment abstraction — NO live gateway is connected.
// Paid courses show "Coming soon / notify me" until the owner
// provides gateway credentials in .env (see .env.example).
// Future: ZarinPal (Iran) + Stripe (international).
// ============================================================

export type PaymentProviderName = "none" | "zarinpal" | "stripe";

export interface CheckoutSession {
  url: string;
  authority: string;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  configured: boolean;
  createCheckout(input: {
    amount: number;
    currency: "IRT" | "USD";
    description: string;
    callbackUrl: string;
    email?: string;
    phone?: string;
  }): Promise<CheckoutSession>;
  verify(input: {
    authority: string;
    amount: number;
  }): Promise<{ ok: boolean; refId?: string; error?: string }>;
}

class DisabledPayments implements PaymentProvider {
  name: PaymentProviderName = "none";
  configured = false;
  async createCheckout(): Promise<CheckoutSession> {
    throw new Error("PAYMENT_PROVIDER is not configured (none).");
  }
  async verify() {
    return { ok: false, error: "payments disabled" };
  }
}

class ZarinPalProvider implements PaymentProvider {
  name: PaymentProviderName = "zarinpal";
  configured =
    !!process.env.ZARINPAL_MERCHANT_ID &&
    process.env.PAYMENT_PROVIDER === "zarinpal";

  async createCheckout(input: {
    amount: number;
    currency: "IRT" | "USD";
    description: string;
    callbackUrl: string;
  }): Promise<CheckoutSession> {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchantId) throw new Error("ZARINPAL_MERCHANT_ID missing");
    // ZarinPal v4 request — amounts in Toman (IRT)
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: input.amount,
        description: input.description,
        callback_url: input.callbackUrl,
        currency: input.currency === "USD" ? "USD" : "IRT",
      }),
    });
    const data = await res.json();
    if (data?.data?.code !== 100) {
      throw new Error("ZarinPal request failed: " + JSON.stringify(data?.errors || data));
    }
    const authority: string = data.data.authority;
    return {
      authority,
      url: `https://www.zarinpal.com/pg/StartPay/${authority}`,
    };
  }

  async verify(input: { authority: string; amount: number }) {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    if (!merchantId) return { ok: false, error: "ZARINPAL_MERCHANT_ID missing" };
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: input.amount,
        authority: input.authority,
      }),
    });
    const data = await res.json();
    if (data?.data?.code === 100) {
      return { ok: true, refId: String(data.data.ref_id) };
    }
    return { ok: false, error: JSON.stringify(data?.errors || data) };
  }
}

class StripeProvider implements PaymentProvider {
  name: PaymentProviderName = "stripe";
  configured =
    !!process.env.STRIPE_SECRET_KEY && process.env.PAYMENT_PROVIDER === "stripe";

  async createCheckout(): Promise<CheckoutSession> {
    // Kept minimal until the owner provides STRIPE_SECRET_KEY.
    // Implement with Stripe Checkout Sessions when going live.
    throw new Error("Stripe provider: connect STRIPE_SECRET_KEY to enable.");
  }
  async verify() {
    return { ok: false as const, error: "Stripe verify not implemented yet" };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const p = (process.env.PAYMENT_PROVIDER || "none").toLowerCase();
  if (p === "zarinpal") return new ZarinPalProvider();
  if (p === "stripe") return new StripeProvider();
  return new DisabledPayments();
}

export function paymentsEnabled() {
  return getPaymentProvider().configured;
}
