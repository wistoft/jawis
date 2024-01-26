import { TestProvision } from "^jarun";

import {
  getJabWatchableProcess_ipc_changeable,
  shutdownQuickFix,
  writeScriptFileThatChanges,
} from "../_fixture";

// a file changes (simple :-)

export default async (prov: TestProvision) => {
  const { wp, hasRestarted } = await getJabWatchableProcess_ipc_changeable(
    prov
  );

  writeScriptFileThatChanges(1000);

  await hasRestarted;

  await shutdownQuickFix(wp);
};
