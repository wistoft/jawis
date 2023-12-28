import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps } from "../_fixture";
import { getPromise } from "^yapu";

//simple use of process

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov, {});

  //have to do all this work by detecting, when the script has done its work.
  //  just because `process.shutdown` has very low timeout.
  const prom = getPromise<void>();

  const process = await pp.useProcess({
    ...deps,
    //this can be removed, when `process.shutdown` has reasonable timeout
    onMessage: (msg: unknown) => {
      prov.log("childMessage", msg);
      if ((msg as any)["type"] === "script-required") {
        //now the script is ready for a quick shutdown
        prom.resolve();
      }
    },
  });

  return prom.promise.then(() => process.kill());
};
