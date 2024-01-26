import { TestProvision } from "^jarun";

import {
  getJabWatchableProcess_ipc_changeable,
  shutdownQuickFix,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../_fixture";

// two different files change

export default async (prov: TestProvision) => {
  const { wp, hasRestarted } = await getJabWatchableProcess_ipc_changeable(
    prov
  );

  writeScriptFileThatChanges(1000);
  writeScriptFileThatChanges2(2000);

  await hasRestarted;

  await shutdownQuickFix(wp);
};
