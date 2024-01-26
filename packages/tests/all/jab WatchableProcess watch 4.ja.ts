import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  getJabWatchableProcess_ipc_changeable,
  shutdownQuickFix,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../_fixture";

// change after shutdown

export default async (prov: TestProvision) => {
  const { wp } = await getJabWatchableProcess_ipc_changeable(prov);

  await shutdownQuickFix(wp);

  writeScriptFileThatChanges(1000);
  writeScriptFileThatChanges2(2000);

  await sleeping(100);
};
