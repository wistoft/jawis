import { TestProvision } from "^jarun";

import { director } from "^ts-reload/util";
import {
  filterScriptStatuses,
  getScriptPath,
  getTsDevDirectorDeps,
} from "^tests/_fixture";
import { ScriptStatus } from "^jagoc";
import { getPromise } from "^jab";

//director auto starts a self-exiting script, then kills it when preloading.

export default (prov: TestProvision) => {
  const prom = getPromise<void>();

  const deps = getTsDevDirectorDeps(prov, {
    scripts: [
      {
        script: getScriptPath("helloTs.ts"),
        autoStart: true,
        autoRestart: false,
      },
    ],
  });

  const poolProv = director({
    ...deps,
    sendProcessStatus: (status: ScriptStatus[]) => {
      prov.imp(filterScriptStatuses(status));

      return poolProv.kill().then(() => {
        prom.resolve();
      });
    },
  });

  return prom.promise;
};
