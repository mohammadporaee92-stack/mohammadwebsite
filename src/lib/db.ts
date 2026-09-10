// ============================================================
// PorAI data layer — node:sqlite (Node.js built-in, zero deps).
// Single-file database, works on ANY Node 22+ host with no
// external services, binary downloads or managed DB.
// Future Postgres migration: keep these repository function
// signatures and swap the SQL dialect (see README).
// ============================================================

import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { existsSync, mkdirSync } from "fs";

function dbPath(): string {
  const raw = process.env.DATABASE_URL || "file:./dev.db";
  const p = raw.startsWith("file:") ? raw.slice(5) : raw;
  const full = resolve(process.cwd(), p);
  const dir = dirname(full);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return full;
}

type GlobalDb = { __poraiDb?: DatabaseSync };
const g = globalThis as GlobalDb;

export const db: DatabaseSync =
  g.__poraiDb ?? (() => {
    const d = new DatabaseSync(dbPath());
    d.exec("PRAGMA journal_mode = WAL;");
    d.exec("PRAGMA foreign_keys = ON;");
    g.__poraiDb = d;
    return d;
  })();

// ---------------- schema (auto-migrate, idempotent) ----------------

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, phone TEXT UNIQUE NOT NULL, name TEXT, email TEXT,
  avatarUrl TEXT, role TEXT NOT NULL DEFAULT 'user', status TEXT NOT NULL DEFAULT 'active',
  preferredLang TEXT NOT NULL DEFAULT 'fa', notifyEmail INTEGER NOT NULL DEFAULT 1,
  notifySms INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(createdAt);

CREATE TABLE IF NOT EXISTS device_sessions (
  id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT, createdAt TEXT NOT NULL, lastSeenAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_devices_user ON device_sessions(userId);

CREATE TABLE IF NOT EXISTS otp_requests (
  id TEXT PRIMARY KEY, phone TEXT NOT NULL, codeHash TEXT NOT NULL,
  expiresAt TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
  consumed INTEGER NOT NULL DEFAULT 0, ip TEXT, createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_requests(phone, createdAt);
CREATE INDEX IF NOT EXISTS idx_otp_ip ON otp_requests(ip, createdAt);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, kind TEXT NOT NULL,
  nameFa TEXT NOT NULL, nameEn TEXT NOT NULL, descFa TEXT, descEn TEXT,
  icon TEXT, sortOrder INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, nameFa TEXT NOT NULL, nameEn TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, kind TEXT NOT NULL DEFAULT 'article',
  status TEXT NOT NULL DEFAULT 'draft', publishAt TEXT, coverUrl TEXT, categoryId TEXT,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL, excerptFa TEXT, excerptEn TEXT,
  contentFa TEXT NOT NULL DEFAULT '', contentEn TEXT NOT NULL DEFAULT '',
  difficulty TEXT, readMinutes INTEGER NOT NULL DEFAULT 5,
  metaTitleFa TEXT, metaTitleEn TEXT, metaDescFa TEXT, metaDescEn TEXT,
  views INTEGER NOT NULL DEFAULT 0, authorName TEXT NOT NULL DEFAULT 'Mohammad Pouraei',
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_articles_kind ON articles(kind, status);
CREATE INDEX IF NOT EXISTS idx_articles_cat ON articles(categoryId);

CREATE TABLE IF NOT EXISTS article_tags (
  articleId TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tagId TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (articleId, tagId)
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL,
  descFa TEXT NOT NULL DEFAULT '', descEn TEXT NOT NULL DEFAULT '',
  outcomesFa TEXT NOT NULL DEFAULT '', outcomesEn TEXT NOT NULL DEFAULT '',
  audienceFa TEXT NOT NULL DEFAULT '', audienceEn TEXT NOT NULL DEFAULT '',
  prereqFa TEXT NOT NULL DEFAULT '', prereqEn TEXT NOT NULL DEFAULT '',
  coverUrl TEXT, promoVideoUrl TEXT, priceType TEXT NOT NULL DEFAULT 'free',
  priceIrt INTEGER, priceUsd INTEGER, level TEXT NOT NULL DEFAULT 'beginner',
  lang TEXT NOT NULL DEFAULT 'both', status TEXT NOT NULL DEFAULT 'draft',
  featured INTEGER NOT NULL DEFAULT 0, categoryId TEXT,
  instructor TEXT NOT NULL DEFAULT 'Mohammad Pouraei',
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY, courseId TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL, sortOrder INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(courseId);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY, moduleId TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL,
  bodyFa TEXT NOT NULL DEFAULT '', bodyEn TEXT NOT NULL DEFAULT '',
  videoUrl TEXT, durationMin INTEGER NOT NULL DEFAULT 10,
  isFree INTEGER NOT NULL DEFAULT 0, sortOrder INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(moduleId);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY, lessonId TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL, url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  courseId TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE, createdAt TEXT NOT NULL,
  UNIQUE(userId, courseId)
);
CREATE INDEX IF NOT EXISTS idx_enroll_course ON enrollments(courseId);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lessonId TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  done INTEGER NOT NULL DEFAULT 0, updatedAt TEXT NOT NULL,
  UNIQUE(userId, lessonId)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  targetType TEXT NOT NULL, targetId TEXT NOT NULL, createdAt TEXT NOT NULL,
  UNIQUE(userId, targetType, targetId)
);

CREATE TABLE IF NOT EXISTS history_items (
  id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  targetType TEXT NOT NULL, targetId TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_user ON history_items(userId, createdAt);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL, bodyFa TEXT, bodyEn TEXT,
  read INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(userId);

CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, logoUrl TEXT,
  descFa TEXT NOT NULL DEFAULT '', descEn TEXT NOT NULL DEFAULT '',
  useCasesFa TEXT NOT NULL DEFAULT '', useCasesEn TEXT NOT NULL DEFAULT '',
  pricing TEXT NOT NULL DEFAULT 'freemium', website TEXT,
  reviewFa TEXT NOT NULL DEFAULT '', reviewEn TEXT NOT NULL DEFAULT '',
  categoryId TEXT, featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published', sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL, coverUrl TEXT,
  summaryFa TEXT NOT NULL DEFAULT '', summaryEn TEXT NOT NULL DEFAULT '',
  problemFa TEXT NOT NULL DEFAULT '', problemEn TEXT NOT NULL DEFAULT '',
  solutionFa TEXT NOT NULL DEFAULT '', solutionEn TEXT NOT NULL DEFAULT '',
  toolsUsed TEXT NOT NULL DEFAULT '',
  processFa TEXT NOT NULL DEFAULT '', processEn TEXT NOT NULL DEFAULT '',
  resultFa TEXT NOT NULL DEFAULT '', resultEn TEXT NOT NULL DEFAULT '',
  lessonsFa TEXT NOT NULL DEFAULT '', lessonsEn TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published', featured INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS journey_entries (
  id TEXT PRIMARY KEY, date TEXT NOT NULL,
  titleFa TEXT NOT NULL, titleEn TEXT NOT NULL,
  bodyFa TEXT NOT NULL DEFAULT '', bodyEn TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'learning', status TEXT NOT NULL DEFAULT 'published',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT, email TEXT, phone TEXT,
  country TEXT, projectType TEXT, budget TEXT, message TEXT NOT NULL,
  unsure INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'new', createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT,
  message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, lang TEXT NOT NULL DEFAULT 'fa',
  active INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY, actorId TEXT, action TEXT NOT NULL, detail TEXT, createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(createdAt);
`;

let migrated = false;
export function migrate() {
  if (migrated) return;
  migrated = true;
  db.exec(SCHEMA);
}
migrate();

// ---------------- helpers ----------------

export type Row = Record<string, unknown>;

export function all<T = Row>(sql: string, ...params: SQLInputValue[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function one<T = Row>(sql: string, ...params: SQLInputValue[]): T | null {
  return (db.prepare(sql).get(...params) as T | undefined) ?? null;
}

export function run(sql: string, ...params: SQLInputValue[]): { changes: number } {
  const r = db.prepare(sql).run(...params);
  return { changes: Number(r.changes) };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function uid(): string {
  return `c${randomBytes(12).toString("hex")}`;
}

const b = (v: unknown) => v === 1 || v === true;

// ---------------- types ----------------

export interface User {
  id: string; phone: string; name: string | null; email: string | null;
  avatarUrl: string | null; role: string; status: string; preferredLang: string;
  notifyEmail: boolean; notifySms: boolean; createdAt: string; updatedAt: string;
}

export interface Category {
  id: string; slug: string; kind: string; nameFa: string; nameEn: string;
  descFa: string | null; descEn: string | null; icon: string | null; sortOrder: number;
}

export interface Article {
  id: string; slug: string; kind: string; status: string; publishAt: string | null;
  coverUrl: string | null; categoryId: string | null;
  titleFa: string; titleEn: string; excerptFa: string | null; excerptEn: string | null;
  contentFa: string; contentEn: string; difficulty: string | null; readMinutes: number;
  metaTitleFa: string | null; metaTitleEn: string | null; metaDescFa: string | null; metaDescEn: string | null;
  views: number; authorName: string; createdAt: string; updatedAt: string;
}

export interface Course {
  id: string; slug: string; titleFa: string; titleEn: string;
  descFa: string; descEn: string; outcomesFa: string; outcomesEn: string;
  audienceFa: string; audienceEn: string; prereqFa: string; prereqEn: string;
  coverUrl: string | null; promoVideoUrl: string | null; priceType: string;
  priceIrt: number | null; priceUsd: number | null; level: string; lang: string;
  status: string; featured: boolean; categoryId: string | null; instructor: string;
  createdAt: string; updatedAt: string;
}

export interface Module { id: string; courseId: string; titleFa: string; titleEn: string; sortOrder: number }
export interface Lesson {
  id: string; moduleId: string; titleFa: string; titleEn: string;
  bodyFa: string; bodyEn: string; videoUrl: string | null; durationMin: number;
  isFree: boolean; sortOrder: number;
}
export interface Attachment { id: string; lessonId: string; title: string; url: string }
export interface Tool {
  id: string; slug: string; name: string; logoUrl: string | null;
  descFa: string; descEn: string; useCasesFa: string; useCasesEn: string;
  pricing: string; website: string | null; reviewFa: string; reviewEn: string;
  categoryId: string | null; featured: boolean; status: string; sortOrder: number;
  createdAt: string; updatedAt: string;
}
export interface Project {
  id: string; slug: string; titleFa: string; titleEn: string; coverUrl: string | null;
  summaryFa: string; summaryEn: string; problemFa: string; problemEn: string;
  solutionFa: string; solutionEn: string; toolsUsed: string;
  processFa: string; processEn: string; resultFa: string; resultEn: string;
  lessonsFa: string; lessonsEn: string; status: string; featured: boolean;
  createdAt: string; updatedAt: string;
}
export interface JourneyEntry {
  id: string; date: string; titleFa: string; titleEn: string;
  bodyFa: string; bodyEn: string; kind: string; status: string; createdAt: string;
}

// ---------------- mappers ----------------

const mapUser = (r: Row): User => ({ ...(r as unknown as User), notifyEmail: b(r.notifyEmail), notifySms: b(r.notifySms) });
const mapCourse = (r: Row): Course => ({ ...(r as unknown as Course), featured: b(r.featured) });
const mapLesson = (r: Row): Lesson => ({ ...(r as unknown as Lesson), isFree: b(r.isFree) });
const mapTool = (r: Row): Tool => ({ ...(r as unknown as Tool), featured: b(r.featured) });
const mapProject = (r: Row): Project => ({ ...(r as unknown as Project), featured: b(r.featured) });

// ---------------- users ----------------

export const Users = {
  byId(id: string): User | null {
    const r = one<Row>("SELECT * FROM users WHERE id = ?", id);
    return r ? mapUser(r) : null;
  },
  byPhone(phone: string): User | null {
    const r = one<Row>("SELECT * FROM users WHERE phone = ?", phone);
    return r ? mapUser(r) : null;
  },
  create(d: { phone: string; name?: string | null; role?: string; preferredLang?: string }): User {
    const id = uid();
    const now = nowIso();
    run(
      "INSERT INTO users (id, phone, name, role, preferredLang, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      id, d.phone, d.name || null, d.role || "user", d.preferredLang || "fa", now, now
    );
    return Users.byId(id)!;
  },
  update(id: string, patch: Partial<{ name: string | null; email: string | null; avatarUrl: string | null; role: string; status: string; preferredLang: string; notifyEmail: boolean; notifySms: boolean }>) {
    const sets: string[] = [];
    const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      sets.push(`${k} = ?`);
      vals.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
    }
    if (!sets.length) return;
    sets.push("updatedAt = ?");
    vals.push(nowIso(), id);
    run(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, ...vals);
  },
  list(o: { search?: string; role?: string; status?: string; limit?: number; offset?: number } = {}): User[] {
    const cond: string[] = [];
    const vals: SQLInputValue[] = [];
    if (o.search) { cond.push("(phone LIKE ? OR name LIKE ? OR email LIKE ?)"); vals.push(`%${o.search}%`, `%${o.search}%`, `%${o.search}%`); }
    if (o.role) { cond.push("role = ?"); vals.push(o.role); }
    if (o.status) { cond.push("status = ?"); vals.push(o.status); }
    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    return all<Row>(`SELECT * FROM users ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, ...vals, o.limit ?? 50, o.offset ?? 0).map(mapUser);
  },
  count(o: { search?: string; role?: string; status?: string } = {}): number {
    const cond: string[] = [];
    const vals: SQLInputValue[] = [];
    if (o.search) { cond.push("(phone LIKE ? OR name LIKE ? OR email LIKE ?)"); vals.push(`%${o.search}%`, `%${o.search}%`, `%${o.search}%`); }
    if (o.role) { cond.push("role = ?"); vals.push(o.role); }
    if (o.status) { cond.push("status = ?"); vals.push(o.status); }
    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    return (one<{ n: number }>(`SELECT COUNT(*) as n FROM users ${where}`, ...vals)?.n) ?? 0;
  },
  countSince(iso: string): number {
    return one<{ n: number }>("SELECT COUNT(*) as n FROM users WHERE createdAt >= ?", iso)?.n ?? 0;
  },
};

// ---------------- devices ----------------

export const Devices = {
  create(userId: string, label: string): string {
    const id = uid();
    const now = nowIso();
    run("INSERT INTO device_sessions (id, userId, label, createdAt, lastSeenAt) VALUES (?, ?, ?, ?, ?)", id, userId, label, now, now);
    return id;
  },
  listByUser(userId: string) {
    return all<Row>("SELECT * FROM device_sessions WHERE userId = ? ORDER BY lastSeenAt DESC", userId);
  },
  remove(id: string) { run("DELETE FROM device_sessions WHERE id = ?", id); },
  removeAll(userId: string) { run("DELETE FROM device_sessions WHERE userId = ?", userId); },
};

// ---------------- OTP ----------------

export interface OtpRow { id: string; phone: string; codeHash: string; expiresAt: string; attempts: number; consumed: number; ip: string | null; createdAt: string }

export const Otps = {
  create(d: { phone: string; codeHash: string; expiresAt: string; ip: string | null }) {
    run("INSERT INTO otp_requests (id, phone, codeHash, expiresAt, ip, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      uid(), d.phone, d.codeHash, d.expiresAt, d.ip, nowIso());
  },
  latestActive(phone: string): OtpRow | null {
    return one<OtpRow>("SELECT * FROM otp_requests WHERE phone = ? AND consumed = 0 ORDER BY createdAt DESC LIMIT 1", phone);
  },
  lastForPhone(phone: string): OtpRow | null {
    return one<OtpRow>("SELECT * FROM otp_requests WHERE phone = ? ORDER BY createdAt DESC LIMIT 1", phone);
  },
  countPhoneSince(phone: string, iso: string): number {
    return one<{ n: number }>("SELECT COUNT(*) as n FROM otp_requests WHERE phone = ? AND createdAt >= ?", phone, iso)?.n ?? 0;
  },
  countIpSince(ip: string, iso: string): number {
    return one<{ n: number }>("SELECT COUNT(*) as n FROM otp_requests WHERE ip = ? AND createdAt >= ?", ip, iso)?.n ?? 0;
  },
  invalidatePhone(phone: string) { run("UPDATE otp_requests SET consumed = 1 WHERE phone = ? AND consumed = 0", phone); },
  consume(id: string) { run("UPDATE otp_requests SET consumed = 1 WHERE id = ?", id); },
  bumpAttempts(id: string) { run("UPDATE otp_requests SET attempts = attempts + 1 WHERE id = ?", id); },
};

// ---------------- categories & tags ----------------

export const Cats = {
  all(kind?: string): Category[] {
    return kind
      ? all<Category>("SELECT * FROM categories WHERE kind = ? ORDER BY sortOrder ASC", kind)
      : all<Category>("SELECT * FROM categories ORDER BY kind, sortOrder ASC");
  },
  bySlug(slug: string): Category | null { return one<Category>("SELECT * FROM categories WHERE slug = ?", slug); },
  byId(id: string): Category | null { return one<Category>("SELECT * FROM categories WHERE id = ?", id); },
  upsert(d: { slug: string; kind: string; nameFa: string; nameEn: string; descFa?: string | null; descEn?: string | null; icon?: string | null; sortOrder?: number }) {
    const ex = Cats.bySlug(d.slug);
    if (ex) {
      run("UPDATE categories SET kind=?, nameFa=?, nameEn=?, descFa=?, descEn=?, icon=?, sortOrder=? WHERE slug=?",
        d.kind, d.nameFa, d.nameEn, d.descFa || null, d.descEn || null, d.icon || null, d.sortOrder ?? 0, d.slug);
      return Cats.bySlug(d.slug)!;
    }
    const id = uid();
    run("INSERT INTO categories (id, slug, kind, nameFa, nameEn, descFa, descEn, icon, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      id, d.slug, d.kind, d.nameFa, d.nameEn, d.descFa || null, d.descEn || null, d.icon || null, d.sortOrder ?? 0);
    return Cats.bySlug(d.slug)!;
  },
  create(d: { slug: string; kind: string; nameFa: string; nameEn: string }) {
    const id = uid();
    run("INSERT INTO categories (id, slug, kind, nameFa, nameEn) VALUES (?, ?, ?, ?, ?)", id, d.slug, d.kind, d.nameFa, d.nameEn);
    return Cats.bySlug(d.slug)!;
  },
  update(id: string, d: Partial<Category>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) { if (v !== undefined && k !== "id") { sets.push(`${k} = ?`); vals.push(v); } }
    if (sets.length) { vals.push(id); run(`UPDATE categories SET ${sets.join(", ")} WHERE id = ?`, ...vals); }
  },
  remove(id: string) { run("DELETE FROM categories WHERE id = ?", id); },
  withArticleCounts(kind: string): Array<Category & { count: number }> {
    return all<Category & { count: number }>(
      `SELECT c.*, (SELECT COUNT(*) FROM articles a WHERE a.categoryId = c.id AND a.status = 'published') as count
       FROM categories c WHERE c.kind = ? ORDER BY c.sortOrder ASC`, kind);
  },
};

export const Tags = {
  all() { return all<Row>("SELECT * FROM tags ORDER BY nameFa"); },
  upsert(slug: string, nameFa: string, nameEn: string) {
    const ex = one<Row>("SELECT * FROM tags WHERE slug = ?", slug);
    if (ex) { run("UPDATE tags SET nameFa=?, nameEn=? WHERE slug=?", nameFa, nameEn, slug); return; }
    run("INSERT INTO tags (id, slug, nameFa, nameEn) VALUES (?, ?, ?, ?)", uid(), slug, nameFa, nameEn);
  },
  forArticle(articleId: string) {
    return all<Row>("SELECT t.* FROM tags t JOIN article_tags at ON at.tagId = t.id WHERE at.articleId = ?", articleId);
  },
  setForArticle(articleId: string, tagIds: string[]) {
    run("DELETE FROM article_tags WHERE articleId = ?", articleId);
    for (const tagId of tagIds) {
      run("INSERT OR IGNORE INTO article_tags (articleId, tagId) VALUES (?, ?)", articleId, tagId);
    }
  },
};

// ---------------- articles ----------------

export interface ArticleFilter { kind?: string; status?: string; categoryId?: string; search?: string; limit?: number; offset?: number; orderBy?: "newest" | "popular" }

function articleWhere(f: ArticleFilter): { where: string; vals: SQLInputValue[] } {
  const cond: string[] = []; const vals: SQLInputValue[] = [];
  if (f.kind) { cond.push("kind = ?"); vals.push(f.kind); }
  if (f.status) { cond.push("status = ?"); vals.push(f.status); }
  if (f.categoryId) { cond.push("categoryId = ?"); vals.push(f.categoryId); }
  if (f.search) { cond.push("(titleFa LIKE ? OR titleEn LIKE ? OR excerptFa LIKE ? OR excerptEn LIKE ?)"); vals.push(`%${f.search}%`, `%${f.search}%`, `%${f.search}%`, `%${f.search}%`); }
  return { where: cond.length ? `WHERE ${cond.join(" AND ")}` : "", vals };
}

export const Articles = {
  list(f: ArticleFilter = {}): Article[] {
    const { where, vals } = articleWhere(f);
    const order = f.orderBy === "popular" ? "views DESC" : "createdAt DESC";
    return all<Article>(`SELECT * FROM articles ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, ...vals, f.limit ?? 50, f.offset ?? 0);
  },
  count(f: ArticleFilter = {}): number {
    const { where, vals } = articleWhere(f);
    return one<{ n: number }>(`SELECT COUNT(*) as n FROM articles ${where}`, ...vals)?.n ?? 0;
  },
  bySlug(slug: string): Article | null { return one<Article>("SELECT * FROM articles WHERE slug = ?", slug); },
  byId(id: string): Article | null { return one<Article>("SELECT * FROM articles WHERE id = ?", id); },
  byIds(ids: string[]): Article[] {
    if (!ids.length) return [];
    return all<Article>(`SELECT * FROM articles WHERE id IN (${ids.map(() => "?").join(",")})`, ...ids);
  },
  upsertBySlug(slug: string, d: Partial<Article> & { titleFa: string; titleEn: string }): Article {
    const ex = Articles.bySlug(slug);
    const now = nowIso();
    if (ex) {
      Articles.update(ex.id, d);
      return Articles.byId(ex.id)!;
    }
    const id = uid();
    run(`INSERT INTO articles (id, slug, kind, status, publishAt, coverUrl, categoryId, titleFa, titleEn, excerptFa, excerptEn, contentFa, contentEn, difficulty, readMinutes, metaTitleFa, metaTitleEn, metaDescFa, metaDescEn, views, authorName, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, slug, d.kind || "article", d.status || "draft", d.publishAt || null, d.coverUrl || null, d.categoryId || null,
      d.titleFa, d.titleEn, d.excerptFa || null, d.excerptEn || null, d.contentFa || "", d.contentEn || "",
      d.difficulty || null, d.readMinutes ?? 5, d.metaTitleFa || null, d.metaTitleEn || null, d.metaDescFa || null, d.metaDescEn || null,
      d.views ?? 0, d.authorName || "Mohammad Pouraei", now, now);
    return Articles.byId(id)!;
  },
  update(id: string, d: Partial<Article>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) { if (v !== undefined && k !== "id") { sets.push(`${k} = ?`); vals.push(v); } }
    sets.push("updatedAt = ?"); vals.push(nowIso(), id);
    run(`UPDATE articles SET ${sets.join(", ")} WHERE id = ?`, ...vals);
  },
  remove(id: string) { run("DELETE FROM articles WHERE id = ?", id); },
  incViews(id: string) { run("UPDATE articles SET views = views + 1 WHERE id = ?", id); },
  allSlugs() { return all<{ slug: string; kind: string; updatedAt: string }>("SELECT slug, kind, updatedAt FROM articles WHERE status = 'published'"); },
};

// ---------------- courses ----------------

export interface CourseWithStats extends Course { lessonCount: number; minutes: number }

export const Courses = {
  list(o: { status?: string; featured?: boolean; search?: string; limit?: number; offset?: number } = {}): CourseWithStats[] {
    const cond: string[] = []; const vals: SQLInputValue[] = [];
    if (o.status) { cond.push("c.status = ?"); vals.push(o.status); }
    if (o.featured !== undefined) { cond.push("c.featured = ?"); vals.push(o.featured ? 1 : 0); }
    if (o.search) { cond.push("(c.titleFa LIKE ? OR c.titleEn LIKE ? OR c.descFa LIKE ? OR c.descEn LIKE ?)"); vals.push(`%${o.search}%`, `%${o.search}%`, `%${o.search}%`, `%${o.search}%`); }
    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    const rows = all<Row>(
      `SELECT c.*,
        (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.moduleId WHERE m.courseId = c.id) as lessonCount,
        (SELECT COALESCE(SUM(l.durationMin),0) FROM lessons l JOIN modules m ON m.id = l.moduleId WHERE m.courseId = c.id) as minutes
       FROM courses c ${where} ORDER BY c.featured DESC, c.createdAt DESC LIMIT ? OFFSET ?`,
      ...vals, o.limit ?? 50, o.offset ?? 0);
    return rows.map((r) => ({ ...mapCourse(r), lessonCount: Number(r.lessonCount), minutes: Number(r.minutes) }));
  },
  count(o: { status?: string } = {}): number {
    return one<{ n: number }>(o.status ? "SELECT COUNT(*) as n FROM courses WHERE status = ?" : "SELECT COUNT(*) as n FROM courses", ...(o.status ? [o.status] : []))?.n ?? 0;
  },
  bySlug(slug: string): Course | null {
    const r = one<Row>("SELECT * FROM courses WHERE slug = ?", slug);
    return r ? mapCourse(r) : null;
  },
  byId(id: string): Course | null {
    const r = one<Row>("SELECT * FROM courses WHERE id = ?", id);
    return r ? mapCourse(r) : null;
  },
  upsertBySlug(slug: string, d: Partial<Course> & { titleFa: string; titleEn: string }): Course {
    const ex = Courses.bySlug(slug);
    if (ex) { Courses.update(ex.id, d); return Courses.byId(ex.id)!; }
    const id = uid(); const now = nowIso();
    run(`INSERT INTO courses (id, slug, titleFa, titleEn, descFa, descEn, outcomesFa, outcomesEn, audienceFa, audienceEn, prereqFa, prereqEn, coverUrl, promoVideoUrl, priceType, priceIrt, priceUsd, level, lang, status, featured, categoryId, instructor, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, slug, d.titleFa, d.titleEn, d.descFa || "", d.descEn || "", d.outcomesFa || "", d.outcomesEn || "",
      d.audienceFa || "", d.audienceEn || "", d.prereqFa || "", d.prereqEn || "", d.coverUrl || null, d.promoVideoUrl || null,
      d.priceType || "free", d.priceIrt ?? null, d.priceUsd ?? null, d.level || "beginner", d.lang || "both",
      d.status || "draft", d.featured ? 1 : 0, d.categoryId || null, d.instructor || "Mohammad Pouraei", now, now);
    return Courses.byId(id)!;
  },
  update(id: string, d: Partial<Course> & { featured?: boolean }) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) {
      if (v === undefined || k === "id") continue;
      sets.push(`${k} = ?`);
      vals.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
    }
    sets.push("updatedAt = ?"); vals.push(nowIso(), id);
    run(`UPDATE courses SET ${sets.join(", ")} WHERE id = ?`, ...vals);
  },
  remove(id: string) { run("DELETE FROM courses WHERE id = ?", id); },
  modules(courseId: string): Module[] {
    return all<Module>("SELECT * FROM modules WHERE courseId = ? ORDER BY sortOrder ASC", courseId);
  },
  lessonsByModule(moduleId: string): Lesson[] {
    return all<Row>("SELECT * FROM lessons WHERE moduleId = ? ORDER BY sortOrder ASC", moduleId).map(mapLesson);
  },
  allLessons(courseId: string): Lesson[] {
    return all<Row>("SELECT l.* FROM lessons l JOIN modules m ON m.id = l.moduleId WHERE m.courseId = ? ORDER BY m.sortOrder, l.sortOrder", courseId).map(mapLesson);
  },
  lessonById(id: string): (Lesson & { courseId: string }) | null {
    return one<Lesson & { courseId: string }>("SELECT l.*, m.courseId as courseId FROM lessons l JOIN modules m ON m.id = l.moduleId WHERE l.id = ?", id);
  },
  attachments(lessonId: string): Attachment[] {
    return all<Attachment>("SELECT * FROM attachments WHERE lessonId = ?", lessonId);
  },
  createModule(courseId: string, d: { titleFa: string; titleEn: string }): Module {
    const id = uid();
    const max = one<{ m: number }>("SELECT COALESCE(MAX(sortOrder),-1)+1 as m FROM modules WHERE courseId = ?", courseId)?.m ?? 0;
    run("INSERT INTO modules (id, courseId, titleFa, titleEn, sortOrder) VALUES (?, ?, ?, ?, ?)", id, courseId, d.titleFa, d.titleEn, max);
    return one<Module>("SELECT * FROM modules WHERE id = ?", id)!;
  },
  updateModule(id: string, d: Partial<Module>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) { if (v !== undefined && k !== "id") { sets.push(`${k} = ?`); vals.push(v); } }
    if (sets.length) { vals.push(id); run(`UPDATE modules SET ${sets.join(", ")} WHERE id = ?`, ...vals); }
  },
  removeModule(id: string) { run("DELETE FROM modules WHERE id = ?", id); },
  createLesson(moduleId: string, d: Partial<Lesson> & { titleFa: string; titleEn: string }): Lesson {
    const id = uid();
    const max = one<{ m: number }>("SELECT COALESCE(MAX(sortOrder),-1)+1 as m FROM lessons WHERE moduleId = ?", moduleId)?.m ?? 0;
    run("INSERT INTO lessons (id, moduleId, titleFa, titleEn, bodyFa, bodyEn, videoUrl, durationMin, isFree, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      id, moduleId, d.titleFa, d.titleEn, d.bodyFa || "", d.bodyEn || "", d.videoUrl || null, d.durationMin ?? 10, d.isFree ? 1 : 0, max);
    return mapLesson(one<Row>("SELECT * FROM lessons WHERE id = ?", id)!);
  },
  updateLesson(id: string, d: Partial<Lesson>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) {
      if (v === undefined || k === "id") continue;
      sets.push(`${k} = ?`);
      vals.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
    }
    if (sets.length) { vals.push(id); run(`UPDATE lessons SET ${sets.join(", ")} WHERE id = ?`, ...vals); }
  },
  removeLesson(id: string) { run("DELETE FROM lessons WHERE id = ?", id); },
  addAttachment(lessonId: string, title: string, url: string) {
    run("INSERT INTO attachments (id, lessonId, title, url) VALUES (?, ?, ?, ?)", uid(), lessonId, title, url);
  },
  removeAttachment(id: string) { run("DELETE FROM attachments WHERE id = ?", id); },
  allSlugs() { return all<{ slug: string; updatedAt: string }>("SELECT slug, updatedAt FROM courses WHERE status = 'published'"); },
};

export const Enroll = {
  get(userId: string, courseId: string) {
    return one<Row>("SELECT * FROM enrollments WHERE userId = ? AND courseId = ?", userId, courseId);
  },
  create(userId: string, courseId: string) {
    run("INSERT OR IGNORE INTO enrollments (id, userId, courseId, createdAt) VALUES (?, ?, ?, ?)", uid(), userId, courseId, nowIso());
  },
  listByUser(userId: string): Array<{ enrollment: Row; course: Course; lessonCount: number; minutes: number }> {
    const rows = all<Row>(
      `SELECT c.* FROM courses c JOIN enrollments e ON e.courseId = c.id WHERE e.userId = ? ORDER BY e.createdAt DESC`, userId);
    return rows.map((r) => {
      const lessons = Courses.allLessons(r.id as string);
      return {
        enrollment: r,
        course: mapCourse(r),
        lessonCount: lessons.length,
        minutes: lessons.reduce((s, l) => s + l.durationMin, 0),
      };
    });
  },
  count(): number { return one<{ n: number }>("SELECT COUNT(*) as n FROM enrollments")?.n ?? 0; },
  countSince(iso: string): number { return one<{ n: number }>("SELECT COUNT(*) as n FROM enrollments WHERE createdAt >= ?", iso)?.n ?? 0; },
  listByCourse(courseId: string) {
    return all<Row>(`SELECT e.*, u.phone as phone, u.name as name FROM enrollments e JOIN users u ON u.id = e.userId WHERE e.courseId = ? ORDER BY e.createdAt DESC`, courseId);
  },
};

export const Progress = {
  set(userId: string, lessonId: string, done: boolean) {
    run("INSERT INTO lesson_progress (id, userId, lessonId, done, updatedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(userId, lessonId) DO UPDATE SET done = excluded.done, updatedAt = excluded.updatedAt",
      uid(), userId, lessonId, done ? 1 : 0, nowIso());
  },
  doneIdsForCourse(userId: string, courseId: string): Set<string> {
    const rows = all<{ lessonId: string }>(
      "SELECT lp.lessonId as lessonId FROM lesson_progress lp JOIN lessons l ON l.id = lp.lessonId JOIN modules m ON m.id = l.moduleId WHERE lp.userId = ? AND m.courseId = ? AND lp.done = 1",
      userId, courseId);
    return new Set(rows.map((r) => r.lessonId));
  },
  isDone(userId: string, lessonId: string): boolean {
    return (one<{ done: number }>("SELECT done FROM lesson_progress WHERE userId = ? AND lessonId = ?", userId, lessonId)?.done ?? 0) === 1;
  },
};

// ---------------- engagement ----------------

export const Bookmarks = {
  toggle(userId: string, targetType: string, targetId: string): boolean {
    const ex = one<Row>("SELECT id FROM bookmarks WHERE userId = ? AND targetType = ? AND targetId = ?", userId, targetType, targetId);
    if (ex) { run("DELETE FROM bookmarks WHERE id = ?", ex.id as string); return false; }
    run("INSERT INTO bookmarks (id, userId, targetType, targetId, createdAt) VALUES (?, ?, ?, ?, ?)", uid(), userId, targetType, targetId, nowIso());
    return true;
  },
  idsByUser(userId: string): Set<string> {
    return new Set(all<{ targetId: string }>("SELECT targetId FROM bookmarks WHERE userId = ?", userId).map((r) => r.targetId));
  },
  listByUser(userId: string) {
    return all<Row>("SELECT * FROM bookmarks WHERE userId = ? ORDER BY createdAt DESC", userId);
  },
};

export const History = {
  add(d: { userId: string; targetType: string; targetId: string; title: string; url: string }) {
    run("INSERT INTO history_items (id, userId, targetType, targetId, title, url, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      uid(), d.userId, d.targetType, d.targetId, d.title, d.url, nowIso());
    const n = one<{ n: number }>("SELECT COUNT(*) as n FROM history_items WHERE userId = ?", d.userId)?.n ?? 0;
    if (n > 60) {
      run(`DELETE FROM history_items WHERE id IN (SELECT id FROM history_items WHERE userId = ? ORDER BY createdAt ASC LIMIT ?)`, d.userId, n - 60);
    }
  },
  listByUser(userId: string, limit = 20) {
    return all<Row>("SELECT * FROM history_items WHERE userId = ? ORDER BY createdAt DESC LIMIT ?", userId, limit);
  },
};

export const Notifs = {
  create(d: { userId: string; titleFa: string; titleEn: string; bodyFa?: string; bodyEn?: string }) {
    run("INSERT INTO notifications (id, userId, titleFa, titleEn, bodyFa, bodyEn, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      uid(), d.userId, d.titleFa, d.titleEn, d.bodyFa || null, d.bodyEn || null, nowIso());
  },
  listByUser(userId: string, limit = 20) {
    return all<Row>("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?", userId, limit);
  },
  unreadCount(userId: string): number {
    return one<{ n: number }>("SELECT COUNT(*) as n FROM notifications WHERE userId = ? AND read = 0", userId)?.n ?? 0;
  },
  markAllRead(userId: string) { run("UPDATE notifications SET read = 1 WHERE userId = ?", userId); },
};

// ---------------- tools ----------------

export const Tools = {
  list(o: { status?: string; featured?: boolean; categoryId?: string; search?: string; limit?: number } = {}): Tool[] {
    const cond: string[] = []; const vals: SQLInputValue[] = [];
    if (o.status) { cond.push("status = ?"); vals.push(o.status); }
    if (o.featured !== undefined) { cond.push("featured = ?"); vals.push(o.featured ? 1 : 0); }
    if (o.categoryId) { cond.push("categoryId = ?"); vals.push(o.categoryId); }
    if (o.search) { cond.push("(name LIKE ? OR descFa LIKE ? OR descEn LIKE ?)"); vals.push(`%${o.search}%`, `%${o.search}%`, `%${o.search}%`); }
    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    return all<Row>(`SELECT * FROM tools ${where} ORDER BY featured DESC, sortOrder ASC LIMIT ?`, ...vals, o.limit ?? 100).map(mapTool);
  },
  count(o: { status?: string } = {}): number {
    return one<{ n: number }>(o.status ? "SELECT COUNT(*) as n FROM tools WHERE status = ?" : "SELECT COUNT(*) as n FROM tools", ...(o.status ? [o.status] : []))?.n ?? 0;
  },
  bySlug(slug: string): Tool | null {
    const r = one<Row>("SELECT * FROM tools WHERE slug = ?", slug);
    return r ? mapTool(r) : null;
  },
  byId(id: string): Tool | null {
    const r = one<Row>("SELECT * FROM tools WHERE id = ?", id);
    return r ? mapTool(r) : null;
  },
  upsertBySlug(slug: string, d: Partial<Tool> & { name: string }): Tool {
    const ex = Tools.bySlug(slug);
    if (ex) { Tools.update(ex.id, d); return Tools.byId(ex.id)!; }
    const id = uid(); const now = nowIso();
    run(`INSERT INTO tools (id, slug, name, logoUrl, descFa, descEn, useCasesFa, useCasesEn, pricing, website, reviewFa, reviewEn, categoryId, featured, status, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, slug, d.name, d.logoUrl || null, d.descFa || "", d.descEn || "", d.useCasesFa || "", d.useCasesEn || "",
      d.pricing || "freemium", d.website || null, d.reviewFa || "", d.reviewEn || "", d.categoryId || null,
      d.featured ? 1 : 0, d.status || "published", d.sortOrder ?? 0, now, now);
    return Tools.byId(id)!;
  },
  update(id: string, d: Partial<Tool>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) {
      if (v === undefined || k === "id") continue;
      sets.push(`${k} = ?`); vals.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
    }
    sets.push("updatedAt = ?"); vals.push(nowIso(), id);
    run(`UPDATE tools SET ${sets.join(", ")} WHERE id = ?`, ...vals);
  },
  remove(id: string) { run("DELETE FROM tools WHERE id = ?", id); },
  allSlugs() { return all<{ slug: string; updatedAt: string }>("SELECT slug, updatedAt FROM tools WHERE status = 'published'"); },
};

// ---------------- projects ----------------

export const Projects = {
  list(o: { status?: string; featured?: boolean; limit?: number } = {}): Project[] {
    const cond: string[] = []; const vals: SQLInputValue[] = [];
    if (o.status) { cond.push("status = ?"); vals.push(o.status); }
    if (o.featured !== undefined) { cond.push("featured = ?"); vals.push(o.featured ? 1 : 0); }
    const where = cond.length ? `WHERE ${cond.join(" AND ")}` : "";
    return all<Row>(`SELECT * FROM projects ${where} ORDER BY featured DESC, createdAt DESC LIMIT ?`, ...vals, o.limit ?? 100).map(mapProject);
  },
  bySlug(slug: string): Project | null {
    const r = one<Row>("SELECT * FROM projects WHERE slug = ?", slug);
    return r ? mapProject(r) : null;
  },
  byId(id: string): Project | null {
    const r = one<Row>("SELECT * FROM projects WHERE id = ?", id);
    return r ? mapProject(r) : null;
  },
  upsertBySlug(slug: string, d: Partial<Project> & { titleFa: string; titleEn: string }): Project {
    const ex = Projects.bySlug(slug);
    if (ex) { Projects.update(ex.id, d); return Projects.byId(ex.id)!; }
    const id = uid(); const now = nowIso();
    run(`INSERT INTO projects (id, slug, titleFa, titleEn, coverUrl, summaryFa, summaryEn, problemFa, problemEn, solutionFa, solutionEn, toolsUsed, processFa, processEn, resultFa, resultEn, lessonsFa, lessonsEn, status, featured, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, slug, d.titleFa, d.titleEn, d.coverUrl || null, d.summaryFa || "", d.summaryEn || "", d.problemFa || "", d.problemEn || "",
      d.solutionFa || "", d.solutionEn || "", d.toolsUsed || "", d.processFa || "", d.processEn || "", d.resultFa || "", d.resultEn || "",
      d.lessonsFa || "", d.lessonsEn || "", d.status || "published", d.featured ? 1 : 0, now, now);
    return Projects.byId(id)!;
  },
  update(id: string, d: Partial<Project>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) {
      if (v === undefined || k === "id") continue;
      sets.push(`${k} = ?`); vals.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
    }
    sets.push("updatedAt = ?"); vals.push(nowIso(), id);
    run(`UPDATE projects SET ${sets.join(", ")} WHERE id = ?`, ...vals);
  },
  remove(id: string) { run("DELETE FROM projects WHERE id = ?", id); },
  allSlugs() { return all<{ slug: string; updatedAt: string }>("SELECT slug, updatedAt FROM projects WHERE status = 'published'"); },
};

// ---------------- journey ----------------

export const Journey = {
  published(limit = 50): JourneyEntry[] {
    return all<JourneyEntry>("SELECT * FROM journey_entries WHERE status = 'published' ORDER BY date DESC LIMIT ?", limit);
  },
  all(): JourneyEntry[] {
    return all<JourneyEntry>("SELECT * FROM journey_entries ORDER BY date DESC");
  },
  create(d: { titleFa: string; titleEn: string; bodyFa?: string; bodyEn?: string; kind?: string; date?: string }) {
    const now = nowIso();
    run("INSERT INTO journey_entries (id, date, titleFa, titleEn, bodyFa, bodyEn, kind, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)",
      uid(), d.date || now, d.titleFa, d.titleEn, d.bodyFa || "", d.bodyEn || "", d.kind || "learning", now);
  },
  update(id: string, d: Partial<JourneyEntry>) {
    const sets: string[] = []; const vals: SQLInputValue[] = [];
    for (const [k, v] of Object.entries(d)) { if (v !== undefined && k !== "id") { sets.push(`${k} = ?`); vals.push(v); } }
    if (sets.length) { vals.push(id); run(`UPDATE journey_entries SET ${sets.join(", ")} WHERE id = ?`, ...vals); }
  },
  remove(id: string) { run("DELETE FROM journey_entries WHERE id = ?", id); },
  clear() { run("DELETE FROM journey_entries"); },
};

// ---------------- leads ----------------

export const Inquiries = {
  create(d: { name: string; company?: string | null; email?: string | null; phone?: string | null; country?: string | null; projectType?: string | null; budget?: string | null; message: string; unsure?: boolean }) {
    run("INSERT INTO inquiries (id, name, company, email, phone, country, projectType, budget, message, unsure, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      uid(), d.name, d.company || null, d.email || null, d.phone || null, d.country || null, d.projectType || null, d.budget || null, d.message, d.unsure ? 1 : 0, nowIso());
  },
  list(o: { status?: string; limit?: number; offset?: number } = {}) {
    const where = o.status ? "WHERE status = ?" : "";
    const vals = o.status ? [o.status] : [];
    return all<Row>(`SELECT * FROM inquiries ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, ...vals, o.limit ?? 50, o.offset ?? 0);
  },
  count(): number { return one<{ n: number }>("SELECT COUNT(*) as n FROM inquiries")?.n ?? 0; },
  setStatus(id: string, status: string) { run("UPDATE inquiries SET status = ? WHERE id = ?", status, id); },
};

export const Messages = {
  create(d: { name: string; email: string; subject?: string | null; message: string }) {
    run("INSERT INTO contact_messages (id, name, email, subject, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      uid(), d.name, d.email, d.subject || null, d.message, nowIso());
  },
  list(limit = 50) { return all<Row>("SELECT * FROM contact_messages ORDER BY createdAt DESC LIMIT ?", limit); },
  count(): number { return one<{ n: number }>("SELECT COUNT(*) as n FROM contact_messages")?.n ?? 0; },
  setStatus(id: string, status: string) { run("UPDATE contact_messages SET status = ? WHERE id = ?", status, id); },
};

export const Subs = {
  subscribe(email: string, lang: string): { duplicate: boolean } {
    const ex = one<Row>("SELECT * FROM subscribers WHERE email = ?", email);
    if (ex) {
      if (ex.active === 1) return { duplicate: true };
      run("UPDATE subscribers SET active = 1, lang = ? WHERE email = ?", lang, email);
      return { duplicate: false };
    }
    run("INSERT INTO subscribers (id, email, lang, createdAt) VALUES (?, ?, ?, ?)", uid(), email, lang, nowIso());
    return { duplicate: false };
  },
  list(limit = 200) { return all<Row>("SELECT * FROM subscribers ORDER BY createdAt DESC LIMIT ?", limit); },
  count(): number { return one<{ n: number }>("SELECT COUNT(*) as n FROM subscribers WHERE active = 1")?.n ?? 0; },
  setActive(email: string, active: boolean) { run("UPDATE subscribers SET active = ? WHERE email = ?", active ? 1 : 0, email); },
};

// ---------------- settings & activity ----------------

export const Settings = {
  get(key: string): string | null {
    return one<{ value: string }>("SELECT value FROM site_settings WHERE key = ?", key)?.value ?? null;
  },
  many(keys: string[]): Record<string, string> {
    const out: Record<string, string> = {};
    for (const k of keys) out[k] = "";
    if (!keys.length) return out;
    const rows = all<{ key: string; value: string }>(`SELECT * FROM site_settings WHERE key IN (${keys.map(() => "?").join(",")})`, ...keys);
    for (const r of rows) out[r.key] = r.value;
    return out;
  },
  set(key: string, value: string) {
    run("INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, value);
  },
};

export const Activity = {
  log(actorId: string | null, action: string, detail?: string) {
    try {
      run("INSERT INTO activity_log (id, actorId, action, detail, createdAt) VALUES (?, ?, ?, ?, ?)", uid(), actorId, action, detail || null, nowIso());
    } catch { /* never break */ }
  },
  recent(limit = 20) {
    return all<Row>("SELECT * FROM activity_log ORDER BY createdAt DESC LIMIT ?", limit);
  },
};
