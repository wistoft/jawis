import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  getJabWatchableProcess_ipc_changeable,
  shutdownQuickFix,
  writeScriptFileThatChanges,
} from "../_fixture";

//same file change after restart event as fired.

export default async (prov: TestProvision) => {
  const { wp, hasRestarted } = await getJabWatchableProcess_ipc_changeable(
    prov
  );

  writeScriptFileThatChanges(1000);
  await hasRestarted;

  writeScriptFileThatChanges(2000);
  await sleeping(200); //todo: wait for second restart event.

  await shutdownQuickFix(wp);
};
