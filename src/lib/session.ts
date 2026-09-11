import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { Users, one } from "./db";
import { normalizePhone } from "./phone";

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
  const sameSite = "lax" as const;
  return {
    password,
    cookieName: "porai_session",
    ttl: SESSION_TTL,
    cookieOptions: {
      secure: isProd,
      httpOnly: true,
      sameSite,
      path: "/",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions());
  if (session.userId) {
    const user = Users.byId(session.userId);
    const device = session.deviceId ? one("SELECT id FROM device_sessions WHERE id = ? AND userId = ?", session.deviceId, session.userId) : null;
    if (!user || user.status !== "active" || !device) {
      // Do not write cookies while rendering a Server Component.
      delete session.userId;
      delete session.role;
      delete session.deviceId;
    } else {
      session.role = user.role as Role;
    }
  }
  return session;
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
    .map(normalizePhone)
    .filter((phone): phone is string => phone !== null);
}
