import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

import {
  getJabWatchableProcessAndWaiter_ipc_changeable,
  writeScriptFileThatChanges,
} from "../_fixture";

//same file change after restart event as fired.

export default async (prov: TestProvision) => {
  const { wp, waiter } =
    await getJabWatchableProcessAndWaiter_ipc_changeable(prov);

  //todo - flacky unless waiting for listening here.

  writeScriptFileThatChanges(1000);

  await waiter.await("restarted");

  writeScriptFileThatChanges(2000); //this doesn't cause a second onRestartNeeded event

  await sleeping(100); // give time for file event (that will never come.)

  await wp.shutdown();
};
