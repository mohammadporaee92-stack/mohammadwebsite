import "./load-env";
import { normalizePhone } from "../src/lib/phone";
import { hashPassword } from "../src/lib/password";
import { Users } from "../src/lib/db";

async function main() {
  const phone = normalizePhone(process.env.ADMIN_BOOTSTRAP_PHONE || "");
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
  if (!phone || password.length < 12 || password.length > 128) {
    throw new Error("Set ADMIN_BOOTSTRAP_PHONE and a 12–128 character ADMIN_BOOTSTRAP_PASSWORD locally.");
  }
  if (Users.byPhone(phone)) throw new Error("Account already exists. No account was modified.");
  Users.create({ phone, name: "Mohammad Poraee", role: "super_admin", preferredLang: "fa", passwordHash: await hashPassword(password) });
  console.log("Administrator created. Remove ADMIN_BOOTSTRAP_PASSWORD from the environment after setup.");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
