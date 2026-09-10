// Normalize Iranian mobile numbers to 09xxxxxxxxx.
// Accepts: 0912..., +98912..., 0098912..., 98912...

export function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let p = raw.replace(/[\s-]/g, "").trim();
  // Persian/Arabic digits -> Latin
  p = p.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  p = p.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  else if (p.startsWith("98") && p.length === 12) p = "0" + p.slice(2);
  if (!/^09\d{9}$/.test(p)) return null;
  return p;
}

export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 4) + "****" + phone.slice(-3);
}
