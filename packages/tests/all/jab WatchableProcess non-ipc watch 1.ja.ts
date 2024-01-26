import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  writeScriptFileThatChanges,
  getJabWatchableProcess_nonIpc_changeable,
} from "../_fixture";

// change after script ended itself. That should have no effect.

export default async (prov: TestProvision) => {
  const { waiter } = await getJabWatchableProcess_nonIpc_changeable(prov);

  await waiter.await("stopped");

  writeScriptFileThatChanges(1000);

  await sleeping(100);
};
