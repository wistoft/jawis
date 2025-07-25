import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  getJabWatchableProcessAndWaiter_ipc_changeable,
  writeScriptFileThatChanges,
  writeScriptFileThatChanges2,
} from "../_fixture";

// change after shutdown

export default async (prov: TestProvision) => {
  const { wp } = await getJabWatchableProcessAndWaiter_ipc_changeable(prov);

  //todo - flacky unless waiting for listening here.

  await wp.shutdown();

  writeScriptFileThatChanges(1000);
  writeScriptFileThatChanges2(2000);

  await sleeping(100); // give time for file event (that will never come.)
};
