// Password hashing — node:crypto scrypt, zero dependencies.
// Stored format: "scrypt$<saltHex>$<hashHex>" (N=16384, r=8, p=1, 64 bytes).

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export const PASSWORD_MIN_LENGTH = 6;

export function isPasswordStrongEnough(password: string): boolean {
  return typeof password === "string" && password.length >= PASSWORD_MIN_LENGTH && password.length <= 128;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored || !stored.startsWith("scrypt$")) return false;
  const [, salt, expected] = stored.split("$");
  if (!salt || !expected) return false;
  try {
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    const a = Buffer.from(hash.toString("hex"), "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
