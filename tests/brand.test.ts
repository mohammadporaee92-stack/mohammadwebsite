import "next/dist/server/node-environment";
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { isTrustedOrigin } from "../src/lib/request-origin";
import { renderRich } from "../src/lib/content";

const require = createRequire(import.meta.url);
const { workAsyncStorage } = require("next/dist/server/app-render/work-async-storage.external");
const { workUnitAsyncStorage } = require("next/dist/server/app-render/work-unit-async-storage.external");
const { ResponseCookies } = require("next/dist/server/web/spec-extension/cookies");

test("brand upgrade, real route handlers and security boundaries", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "porai-tests-"));
  process.env.DATABASE_URL = "file:" + join(dir, "test.db");
  process.env.SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.ADMIN_PHONES = "+989121234567";
  const data = await import("../src/lib/db");
  const { runBaseSeed } = await import("../src/lib/seeds/base");
  const legacyCourse = data.Courses.upsertBySlug("practical-chatgpt-start", {
    titleFa: "قدیمی", titleEn: "Legacy", status: "published",
  });
  const legacyModule = data.Courses.createModule(legacyCourse.id, { titleFa: "قدیمی", titleEn: "Legacy" });
  const legacyLesson = data.Courses.createLesson(legacyModule.id, { titleFa: "قدیمی", titleEn: "Legacy", isFree: true });
  data.Projects.upsertBySlug("engineering-doc-rag", { titleFa: "نمونه", titleEn: "Example", status: "published" });
  await runBaseSeed();

  await t.test("publishes complete bilingual text lessons and retires examples without deletion", () => {
    assert.equal(data.Articles.count({ status: "published", kind: "tutorial" }), 6);
    assert.equal(data.Projects.list({ status: "published" }).length, 0);
    assert.equal(data.Courses.byId(legacyCourse.id)?.status, "draft");
    assert.ok(data.Courses.lessonById(legacyLesson.id));
    const course = data.Courses.bySlug("ai-from-zero")!;
    const lessons = data.Courses.allLessons(course.id);
    assert.equal(lessons.length, 6);
    assert.equal(course.outcomesEn.split("\n").length, 4);
    const blog = data.Articles.bySlug("learn-ai-one-task")!;
    assert.equal((renderRich(blog.contentEn).match(/<h2>/g) || []).length, 4);
    assert.ok(lessons.every(l => l.isFree && l.bodyFa.length > 500 && l.bodyEn.length > 500 && !l.videoUrl));
    assert.ok(data.Articles.list({ status: "published" }).every(a => a.views === 0));
  });

  const jar = new ResponseCookies(new Headers());
  const scope = <T,>(fn: () => Promise<T>, cookieJar = jar): Promise<T> =>
    workAsyncStorage.run({ isStaticGeneration: false, route: "/api/test" },
      () => workUnitAsyncStorage.run({ type: "request", phase: "action", userspaceMutableCookies: cookieJar, cookies: cookieJar }, fn));
  const req = (body: object) => new Request("http://localhost/api/test", {
    method: "POST", headers: { "content-type": "application/json", origin: "http://localhost", "x-forwarded-for": "127.0.0.9" },
    body: JSON.stringify(body),
  });
  const register = (await import("../src/app/api/auth/register/route")).POST;
  const login = (await import("../src/app/api/auth/login/route")).POST;
  const password = randomBytes(18).toString("hex");

  await t.test("public registration cannot claim a reserved admin phone", async () => {
    const response = await scope(() => register(req({ phone: "09121234567", password, name: "Reserved" })));
    assert.equal(response.status, 403);
    assert.equal(data.Users.byPhone("09121234567"), null);
  });

  await t.test("registration creates a normal account and a usable session", async () => {
    const response = await scope(() => register(req({ phone: "09120000001", password, name: "Test learner", lang: "fa" })));
    assert.equal(response.status, 200);
    const { getCurrentUser } = await import("../src/lib/session");
    const user = await scope(() => getCurrentUser());
    assert.equal(user?.role, "user");
    assert.equal(user?.phone, "09120000001");
  });

  await t.test("enrollment, completion and bookmarks persist across a seed rerun", async () => {
    const enroll = (await import("../src/app/api/enroll/route")).POST;
    const progress = (await import("../src/app/api/progress/route")).POST;
    const bookmark = (await import("../src/app/api/bookmarks/route")).POST;
    const user = data.Users.byPhone("09120000001")!;
    const course = data.Courses.bySlug("ai-from-zero")!;
    const lesson = data.Courses.allLessons(course.id)[0];
    assert.equal((await scope(() => enroll(req({ courseSlug: course.slug })))).status, 200);
    assert.equal((await scope(() => progress(req({ lessonId: lesson.id, done: true })))).status, 200);
    assert.equal((await scope(() => bookmark(req({ targetType: "course", targetId: course.id })))).status, 200);
    data.Courses.upsertBySlug("paid-check", { titleFa: "پرداخت", titleEn: "Paid", status: "published", priceType: "paid" });
    process.env.PAYMENT_PROVIDER = "stripe";
    assert.equal((await scope(() => enroll(req({ courseSlug: "paid-check" })))).status, 402);
    delete process.env.PAYMENT_PROVIDER;
    data.Articles.update(data.Articles.bySlug("ai-first-steps")!.id, { titleFa: "ویرایش مدیر" });
    data.Settings.set("bio_fa", "Owner edit");
    await runBaseSeed();
    assert.equal(data.Courses.allLessons(course.id)[0].id, lesson.id);
    assert.ok(data.Progress.isDone(user.id, lesson.id));
    assert.ok(data.Enroll.get(user.id, course.id));
    assert.ok(data.Bookmarks.idsByUser(user.id).has(course.id));
    assert.equal(data.Settings.get("bio_fa"), "Owner edit");
    assert.equal(data.Articles.bySlug("ai-first-steps")?.titleFa, "ویرایش مدیر");
  });

  await t.test("revocation invalidates existing cookies and login issues a fresh device", async () => {
    const { getCurrentUser } = await import("../src/lib/session");
    const user = data.Users.byPhone("09120000001")!;
    data.Devices.removeAll(user.id);
    assert.equal(await scope(() => getCurrentUser()), null);
    const freshJar = new ResponseCookies(new Headers());
    assert.equal((await scope(() => login(req({ phone: "09120000001", password })), freshJar)).status, 200);
    assert.equal((await scope(() => getCurrentUser(), freshJar))?.id, user.id);
    const { getSession } = await import("../src/lib/session");
    data.Users.update(user.id, { role: "admin" });
    assert.equal((await scope(() => getSession(), freshJar)).role, "admin");
    data.Users.update(user.id, { role: "user" });
    assert.equal((await scope(() => getSession(), freshJar)).role, "user");
    data.Users.update(user.id, { status: "disabled" });
    assert.equal(await scope(() => getCurrentUser(), freshJar), null);
  });

  await t.test("SMS reset endpoints stay disabled", async () => {
    const requestCode = (await import("../src/app/api/auth/request-code/route")).POST;
    const reset = (await import("../src/app/api/auth/reset/route")).POST;
    assert.equal((await requestCode()).status, 410);
    assert.equal((await reset()).status, 410);
    assert.equal(data.one<{ n: number }>("SELECT count(*) n FROM otp_requests")?.n, 0);
  });

  await t.test("contact and inquiry handlers store valid input and reject invalid forms", async () => {
    const contact = (await import("../src/app/api/contact/route")).POST;
    const inquiry = (await import("../src/app/api/inquiries/route")).POST;
    assert.equal((await contact(req({ name: "QA", email: "qa@example.test", message: "Test message" }))).status, 200);
    assert.equal((await contact(req({ name: "", email: "bad", message: "" }))).status, 400);
    assert.equal((await inquiry(req({ name: "QA", message: "Automation question", unsure: true }))).status, 200);
    assert.equal(data.one<{ n: number }>("SELECT count(*) n FROM contact_messages")?.n, 1);
    assert.equal(data.one<{ n: number }>("SELECT count(*) n FROM inquiries")?.n, 1);
  });
  data.db.close();
  rmSync(dir, { recursive: true, force: true });
});

test("CSRF origin guard fails closed for foreign, null and missing origins", () => {
  const request = (origin?: string) => new Request("https://porai.example/api/enroll", { headers: origin ? { origin } : {} });
  assert.ok(isTrustedOrigin(request("https://porai.example")));
  assert.equal(isTrustedOrigin(request("https://evil.example")), false);
  assert.equal(isTrustedOrigin(request("null")), false);
  assert.equal(isTrustedOrigin(request()), false);
});

test("article text escapes executable HTML and unsafe links", () => {
  const html = renderRich('<script>alert(1)</script>\n[click](javascript:alert)\n[Docs](https://example.com)');
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('href="https://example.com"'));
});
