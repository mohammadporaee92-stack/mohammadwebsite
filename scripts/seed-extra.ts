// PorAI extra seed — thin wrapper (logic lives in src/lib/seeds so production can run it too).
import { runExtraSeed } from "../src/lib/seeds/extra";

runExtraSeed().catch((e) => {
  console.error(e);
  process.exit(1);
});
