import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  writeScriptFileThatChanges,
  getJabWatchableProcess_nonIpc_changeable,
} from "../_fixture";

// change after script ended itself. That should have no effect.

export default async (prov: TestProvision) => {
  await getJabWatchableProcess_nonIpc_changeable(prov);

  await sleeping(200);

  writeScriptFileThatChanges(1000);

  await sleeping(100);
};
