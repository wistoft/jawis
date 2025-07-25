import { TestProvision } from "^jarun";

import {
  getJabWatchableProcessAndWaiter_ipc_changeable,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../_fixture";

// two different files change

export default async (prov: TestProvision) => {
  const { wp, waiter } =
    await getJabWatchableProcessAndWaiter_ipc_changeable(prov);

  //todo - flacky unless waiting for listening here.

  writeScriptFileThatChanges(1000);
  writeScriptFileThatChanges2(2000);

  await waiter.await("restarted");

  await wp.shutdown();
};
