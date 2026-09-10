import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { getCurrentUser, isStaff } from "@/lib/session";
import { dbFilePath, exec } from "@/lib/db";

// Staff-only database backup download: checkpoints WAL, then streams the .db file.
export async function GET() {
  const u = await getCurrentUser();
  if (!u || !isStaff(u.role)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  exec("PRAGMA wal_checkpoint(TRUNCATE)");
  const buf = Buffer.from(readFileSync(dbFilePath()));
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/x-sqlite3",
      "Content-Disposition": `attachment; filename="porai-backup-${day}.db"`,
      "Content-Length": String(buf.length),
    },
  });
}
