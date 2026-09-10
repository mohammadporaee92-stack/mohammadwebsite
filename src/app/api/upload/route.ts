import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { getSession, isStaff } from "@/lib/session";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !isStaff(session.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  const mime = file.type;
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }
  const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" }[mime as string] || "bin";
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), buf);
  return NextResponse.json({ url: `/uploads/${name}` });
}
