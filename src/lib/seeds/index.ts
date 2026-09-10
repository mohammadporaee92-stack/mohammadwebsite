// PorAI seed entry — shared by local scripts and the production /api/setup route.
import { runBaseSeed } from "./base";
import { runExtraSeed } from "./extra";

export async function runAllSeeds() {
  await runBaseSeed();
  await runExtraSeed();
}
