import { TestProvision } from "^jarun";

import {
  getJabWatchableProcess,
  getScriptPath,
  logRequireMessage,
} from "../_fixture";

//show the require messages wpp sends.

export default async (prov: TestProvision) => {
  const { waiter } = await getJabWatchableProcess(prov, {
    def: { filename: getScriptPath("WPP_require.js") },
    filterRequireMessages: false,
    onMessage: (m: any) => {
      logRequireMessage(m);
    },
  });

  await waiter.await("exit");
};
