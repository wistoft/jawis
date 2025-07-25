import { TestProvision } from "^jarun";

import {
  getJabWatchableProcessAndWaiter_ipc_changeable,
  writeScriptFileThatChanges,
} from "../_fixture";

// a file changes (simple :-)

export default async (prov: TestProvision) => {
  const { wp, waiter } =
    await getJabWatchableProcessAndWaiter_ipc_changeable(prov);

  //todo - flacky unless waiting for listening here.

  writeScriptFileThatChanges(1000);

  await waiter.await("restarted");

  await wp.shutdown();
};
