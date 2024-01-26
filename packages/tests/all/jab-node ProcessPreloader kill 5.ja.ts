import { TestProvision } from "^jarun";

import { BeeDeps, InMemoryBee } from "^bee-common";
import { getJabProcessPreloader } from "../_fixture";

//must be able to handle message from ProcessPreloaderMain after kill and before onExit.

export default async (prov: TestProvision) =>
  getJabProcessPreloader(prov, {
    makeBee,
  }).kill();

/**
 * Send ready after ProcessPreloader has called kill
 */
export const makeBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onTerminate: (bee) => {
      bee.sendBack({ type: "ready" } as any);
    },
  });
