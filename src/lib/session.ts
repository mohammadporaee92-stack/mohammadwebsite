import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { Users } from "./db";

export type Role = "super_admin" | "admin" | "editor" | "instructor" | "user";

export interface SessionData {
  userId?: string;
  role?: Role;
  deviceId?: string;
}

const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

export function sessionOptions() {
  const password = process.env.SESSION_SECRET || "";
  if (password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set in .env and be at least 32 characters."
    );
  }
  const isProd = process.env.NODE_ENV === "production";
  // SameSite=None (+Secure) in production so the session survives inside the
  // proxied preview iframe (cross-site context). On the real first-party
  // domain this also works fine. Override with SESSION_SAMESITE=lax|strict
  // if you want tighter CSRF defaults and never embed the site in iframes.
  const sameSite = (process.env.SESSION_SAMESITE as "lax" | "strict" | "none" | undefined)
    || (isProd ? "none" : "lax");
  return {
    password,
    cookieName: "porai_session",
    ttl: SESSION_TTL,
    cookieOptions: {
      secure: isProd ? true : sameSite === "none" ? true : false,
      httpOnly: true,
      sameSite,
      path: "/",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = Users.byId(session.userId);
  if (!user || user.status !== "active") return null;
  return user;
}

const STAFF_ROLES: Role[] = ["super_admin", "admin", "editor", "instructor"];

export function isStaff(role?: string | null) {
  return !!role && (STAFF_ROLES as string[]).includes(role);
}

export function canManageUsers(role?: string | null) {
  return role === "super_admin" || role === "admin";
}

export function canManageContent(role?: string | null) {
  return isStaff(role);
}

export function canManageSettings(role?: string | null) {
  return role === "super_admin" || role === "admin";
}

export function adminPhones(): string[] {
  return (process.env.ADMIN_PHONES || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}
