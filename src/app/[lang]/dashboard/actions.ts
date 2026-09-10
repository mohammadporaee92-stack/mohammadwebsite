"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Users, Devices, Notifs } from "@/lib/db";
import { getSession } from "@/lib/session";

async function requireUser() {
  const session = await getSession();
  if (!session.userId) throw new Error("unauthorized");
  const user = Users.byId(session.userId);
  if (!user || user.status !== "active") throw new Error("unauthorized");
  return { session, user };
}

const ProfileSchema = z.object({
  name: z.string().max(80).optional(),
  email: z.string().email().max(120).optional().or(z.literal("")),
  preferredLang: z.enum(["fa", "en"]).optional(),
  notifyEmail: z.string().optional(),
  notifySms: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const { user } = await requireUser();
  const raw = Object.fromEntries(formData.entries());
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) return;
  const p = parsed.data;
  Users.update(user.id, {
    name: p.name?.trim() || null,
    email: p.email?.trim() || null,
    preferredLang: p.preferredLang || user.preferredLang,
    notifyEmail: p.notifyEmail === "on",
    notifySms: p.notifySms === "on",
  });
  revalidatePath("/", "layout");
}

export async function logoutAllDevices() {
  const { session, user } = await requireUser();
  Devices.removeAll(user.id);
  session.destroy();
}

export async function signOut(lang: string) {
  const session = await getSession();
  if (session.deviceId) {
    try { Devices.remove(session.deviceId); } catch { /* ignore */ }
  }
  session.destroy();
  redirect(`/${lang}`);
}

export async function markNotificationsRead() {
  const { user } = await requireUser();
  Notifs.markAllRead(user.id);
  revalidatePath("/", "layout");
}
