"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, canManageContent, canManageUsers, canManageSettings } from "@/lib/session";
import {
  Articles, Courses, Users, Tools, Projects, Journey, Tags,
  Settings, Inquiries, Messages, Subs, Activity,
} from "@/lib/db";

type Perm = "content" | "users" | "settings";

async function staffOrThrow(perm: Perm = "content") {
  const session = await getSession();
  const ok =
    perm === "users" ? canManageUsers(session.role)
    : perm === "settings" ? canManageSettings(session.role)
    : canManageContent(session.role);
  if (!session.userId || !ok) throw new Error("forbidden");
  return session;
}

function str(fd: FormData, k: string): string {
  return String(fd.get(k) || "").trim();
}
function num(fd: FormData, k: string): number | null {
  const v = String(fd.get(k) || "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `item-${Date.now()}`;
}
function back(lang: string, path: string) {
  revalidatePath("/", "layout");
  redirect(`/${lang}/admin/${path}`);
}

// ---------------- articles ----------------

export async function saveArticle(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const isNew = !id || id === "new";
  const slug = str(formData, "slug") || slugify(str(formData, "titleEn") || str(formData, "titleFa"));
  const data = {
    slug,
    kind: str(formData, "kind") || "article",
    status: str(formData, "status") || "draft",
    publishAt: str(formData, "publishAt") ? new Date(str(formData, "publishAt")).toISOString() : null,
    coverUrl: str(formData, "coverUrl") || null,
    categoryId: str(formData, "categoryId") || null,
    titleFa: str(formData, "titleFa"),
    titleEn: str(formData, "titleEn"),
    excerptFa: str(formData, "excerptFa") || null,
    excerptEn: str(formData, "excerptEn") || null,
    contentFa: str(formData, "contentFa"),
    contentEn: str(formData, "contentEn"),
    difficulty: str(formData, "difficulty") || null,
    readMinutes: num(formData, "readMinutes") ?? 5,
    metaTitleFa: str(formData, "metaTitleFa") || null,
    metaTitleEn: str(formData, "metaTitleEn") || null,
    metaDescFa: str(formData, "metaDescFa") || null,
    metaDescEn: str(formData, "metaDescEn") || null,
    authorName: str(formData, "authorName") || "Mohammad Pouraei",
  };
  let articleId = id;
  if (isNew) {
    const created = Articles.upsertBySlug(slug, data as never);
    articleId = created.id;
  } else {
    Articles.update(id, data as never);
  }
  const tagIds = formData.getAll("tagIds").map(String);
  Tags.setForArticle(articleId, tagIds);
  Activity.log(s.userId!, isNew ? "article_created" : "article_updated", slug);
  back(lang, `articles/${articleId}`);
}

export async function deleteArticle(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const a = Articles.byId(id);
  Articles.remove(id);
  Activity.log(s.userId!, "article_deleted", a?.slug || id);
  back(lang, "articles");
}

// ---------------- courses ----------------

export async function saveCourse(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const isNew = !id || id === "new";
  const slug = str(formData, "slug") || slugify(str(formData, "titleEn") || str(formData, "titleFa"));
  const data = {
    slug,
    titleFa: str(formData, "titleFa"),
    titleEn: str(formData, "titleEn"),
    descFa: str(formData, "descFa"),
    descEn: str(formData, "descEn"),
    outcomesFa: str(formData, "outcomesFa"),
    outcomesEn: str(formData, "outcomesEn"),
    audienceFa: str(formData, "audienceFa"),
    audienceEn: str(formData, "audienceEn"),
    prereqFa: str(formData, "prereqFa"),
    prereqEn: str(formData, "prereqEn"),
    coverUrl: str(formData, "coverUrl") || null,
    promoVideoUrl: str(formData, "promoVideoUrl") || null,
    priceType: str(formData, "priceType") || "free",
    priceIrt: num(formData, "priceIrt"),
    priceUsd: num(formData, "priceUsd"),
    level: str(formData, "level") || "beginner",
    lang: str(formData, "courseLang") || "both",
    status: str(formData, "status") || "draft",
    featured: formData.get("featured") === "on",
    categoryId: str(formData, "categoryId") || null,
    instructor: str(formData, "instructor") || "Mohammad Pouraei",
  };
  let courseId = id;
  if (isNew) {
    courseId = Courses.upsertBySlug(slug, data as never).id;
  } else {
    Courses.update(id, data as never);
  }
  Activity.log(s.userId!, isNew ? "course_created" : "course_updated", slug);
  back(lang, `courses/${courseId}`);
}

export async function deleteCourse(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const c = Courses.byId(id);
  Courses.remove(id);
  Activity.log(s.userId!, "course_deleted", c?.slug || id);
  back(lang, "courses");
}

export async function saveModule(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  const id = str(formData, "id");
  if (!id || id === "new") {
    Courses.createModule(courseId, { titleFa: str(formData, "titleFa"), titleEn: str(formData, "titleEn") });
  } else {
    Courses.updateModule(id, { titleFa: str(formData, "titleFa"), titleEn: str(formData, "titleEn") });
  }
  Activity.log(s.userId!, "module_saved", courseId);
  back(lang, `courses/${courseId}`);
}

export async function deleteModule(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  Courses.removeModule(str(formData, "id"));
  Activity.log(s.userId!, "module_deleted", courseId);
  back(lang, `courses/${courseId}`);
}

export async function moveModule(formData: FormData) {
  await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  const id = str(formData, "id");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const mods = Courses.modules(courseId);
  const i = mods.findIndex((m) => m.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < mods.length) {
    Courses.updateModule(mods[i].id, { sortOrder: mods[j].sortOrder });
    Courses.updateModule(mods[j].id, { sortOrder: mods[i].sortOrder });
  }
  back(lang, `courses/${courseId}`);
}

export async function saveLesson(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  const moduleId = str(formData, "moduleId");
  const id = str(formData, "id");
  const data = {
    titleFa: str(formData, "titleFa"),
    titleEn: str(formData, "titleEn"),
    bodyFa: str(formData, "bodyFa"),
    bodyEn: str(formData, "bodyEn"),
    videoUrl: str(formData, "videoUrl") || null,
    durationMin: num(formData, "durationMin") ?? 10,
    isFree: formData.get("isFree") === "on",
  };
  if (!id || id === "new") {
    Courses.createLesson(moduleId, data);
  } else {
    Courses.updateLesson(id, data);
  }
  Activity.log(s.userId!, "lesson_saved", courseId);
  back(lang, `courses/${courseId}`);
}

export async function deleteLesson(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  Courses.removeLesson(str(formData, "id"));
  Activity.log(s.userId!, "lesson_deleted", courseId);
  back(lang, `courses/${courseId}`);
}

export async function moveLesson(formData: FormData) {
  await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  const moduleId = str(formData, "moduleId");
  const id = str(formData, "id");
  const dir = str(formData, "dir") === "up" ? -1 : 1;
  const lessons = Courses.lessonsByModule(moduleId);
  const i = lessons.findIndex((l) => l.id === id);
  const j = i + dir;
  if (i >= 0 && j >= 0 && j < lessons.length) {
    Courses.updateLesson(lessons[i].id, { sortOrder: lessons[j].sortOrder });
    Courses.updateLesson(lessons[j].id, { sortOrder: lessons[i].sortOrder });
  }
  back(lang, `courses/${courseId}`);
}

export async function addAttachment(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  Courses.addAttachment(str(formData, "lessonId"), str(formData, "title"), str(formData, "url"));
  Activity.log(s.userId!, "attachment_added", courseId);
  back(lang, `courses/${courseId}`);
}

export async function deleteAttachment(formData: FormData) {
  await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const courseId = str(formData, "courseId");
  Courses.removeAttachment(str(formData, "id"));
  back(lang, `courses/${courseId}`);
}

// ---------------- users ----------------

export async function setUserRole(formData: FormData) {
  const s = await staffOrThrow("users");
  if (s.role !== "super_admin" && str(formData, "role") === "super_admin") {
    throw new Error("forbidden");
  }
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  if (id === s.userId) throw new Error("forbidden"); // can't change own role
  Users.update(id, { role: str(formData, "role") });
  Activity.log(s.userId!, "user_role_changed", `${id} -> ${str(formData, "role")}`);
  back(lang, "users");
}

export async function setUserStatus(formData: FormData) {
  const s = await staffOrThrow("users");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  if (id === s.userId) throw new Error("forbidden");
  Users.update(id, { status: str(formData, "status") });
  Activity.log(s.userId!, "user_status_changed", `${id} -> ${str(formData, "status")}`);
  back(lang, "users");
}

export async function adminSetPassword(formData: FormData) {
  const s = await staffOrThrow("users");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const pw = str(formData, "password");
  const { hashPassword, isPasswordStrongEnough } = await import("@/lib/password");
  if (pw && isPasswordStrongEnough(pw)) {
    Users.update(id, { passwordHash: await hashPassword(pw) });
    Activity.log(s.userId!, "admin_password_set", id);
  }
  back(lang, "users");
}

// ---------------- tools / projects / journey ----------------

export async function saveTool(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const isNew = !id || id === "new";
  const slug = str(formData, "slug") || slugify(str(formData, "name"));
  const data = {
    slug,
    name: str(formData, "name"),
    logoUrl: str(formData, "logoUrl") || null,
    descFa: str(formData, "descFa"),
    descEn: str(formData, "descEn"),
    useCasesFa: str(formData, "useCasesFa"),
    useCasesEn: str(formData, "useCasesEn"),
    pricing: str(formData, "pricing") || "freemium",
    website: str(formData, "website") || null,
    reviewFa: str(formData, "reviewFa"),
    reviewEn: str(formData, "reviewEn"),
    categoryId: str(formData, "categoryId") || null,
    featured: formData.get("featured") === "on",
    status: str(formData, "status") || "published",
    sortOrder: num(formData, "sortOrder") ?? 0,
  };
  if (isNew) Tools.upsertBySlug(slug, data as never);
  else Tools.update(id, data as never);
  Activity.log(s.userId!, isNew ? "tool_created" : "tool_updated", slug);
  back(lang, "tools");
}

export async function deleteTool(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  Tools.remove(str(formData, "id"));
  Activity.log(s.userId!, "tool_deleted", str(formData, "id"));
  back(lang, "tools");
}

export async function saveProject(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const isNew = !id || id === "new";
  const slug = str(formData, "slug") || slugify(str(formData, "titleEn") || str(formData, "titleFa"));
  const data = {
    slug,
    titleFa: str(formData, "titleFa"),
    titleEn: str(formData, "titleEn"),
    coverUrl: str(formData, "coverUrl") || null,
    summaryFa: str(formData, "summaryFa"),
    summaryEn: str(formData, "summaryEn"),
    problemFa: str(formData, "problemFa"),
    problemEn: str(formData, "problemEn"),
    solutionFa: str(formData, "solutionFa"),
    solutionEn: str(formData, "solutionEn"),
    toolsUsed: str(formData, "toolsUsed"),
    processFa: str(formData, "processFa"),
    processEn: str(formData, "processEn"),
    resultFa: str(formData, "resultFa"),
    resultEn: str(formData, "resultEn"),
    lessonsFa: str(formData, "lessonsFa"),
    lessonsEn: str(formData, "lessonsEn"),
    status: str(formData, "status") || "published",
    featured: formData.get("featured") === "on",
  };
  if (isNew) Projects.upsertBySlug(slug, data as never);
  else Projects.update(id, data as never);
  Activity.log(s.userId!, isNew ? "project_created" : "project_updated", slug);
  back(lang, "projects");
}

export async function deleteProject(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  Projects.remove(str(formData, "id"));
  Activity.log(s.userId!, "project_deleted", str(formData, "id"));
  back(lang, "projects");
}

export async function saveJourney(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  const id = str(formData, "id");
  const data = {
    titleFa: str(formData, "titleFa"),
    titleEn: str(formData, "titleEn"),
    bodyFa: str(formData, "bodyFa"),
    bodyEn: str(formData, "bodyEn"),
    kind: str(formData, "kind") || "learning",
    status: str(formData, "status") || "published",
    date: str(formData, "date") ? new Date(str(formData, "date")).toISOString() : new Date().toISOString(),
  };
  if (!id || id === "new") Journey.create(data);
  else Journey.update(id, data);
  Activity.log(s.userId!, "journey_saved", data.titleEn || data.titleFa);
  back(lang, "journey");
}

export async function deleteJourney(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  Journey.remove(str(formData, "id"));
  Activity.log(s.userId!, "journey_deleted", str(formData, "id"));
  back(lang, "journey");
}

// ---------------- leads & settings ----------------

export async function setInquiryStatus(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  Inquiries.setStatus(str(formData, "id"), str(formData, "status"));
  Activity.log(s.userId!, "inquiry_status", str(formData, "id"));
  back(lang, "inquiries");
}

export async function setMessageStatus(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  Messages.setStatus(str(formData, "id"), str(formData, "status"));
  Activity.log(s.userId!, "message_status", str(formData, "id"));
  back(lang, "inquiries");
}

export async function toggleSubscriber(formData: FormData) {
  const s = await staffOrThrow("content");
  const lang = str(formData, "lang") || "fa";
  Subs.setActive(str(formData, "email"), str(formData, "active") === "1");
  Activity.log(s.userId!, "subscriber_toggled", str(formData, "email"));
  back(lang, "newsletter");
}

export async function saveSettings(formData: FormData) {
  const s = await staffOrThrow("settings");
  const lang = str(formData, "lang") || "fa";
  for (const [k, v] of formData.entries()) {
    if (k === "lang") continue;
    Settings.set(k, String(v));
  }
  Activity.log(s.userId!, "settings_updated", "");
  back(lang, "settings");
}
