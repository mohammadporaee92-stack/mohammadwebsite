import "./load-env";
// PorAI base seed — thin wrapper (logic lives in src/lib/seeds so production can run it too).
import { runBaseSeed } from "../src/lib/seeds/base";

runBaseSeed().catch((e) => {
  console.error(e);
  process.exit(1);
});
