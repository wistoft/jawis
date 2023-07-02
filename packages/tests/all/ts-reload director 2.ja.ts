import { TestProvision } from "^jarun";
import { ScriptStatusTypes } from "^jagoc";
import { getPromise } from "^yapu";

import { director } from "^ts-reload/util";
import {
  filterAbsoluteFilepath,
  getScriptPath,
  getTsReloadDirectorDeps,
} from "^tests/_fixture";

//director auto starts a self-exiting script, then kills it when preloading.

export default (prov: TestProvision) => {
  const prom = getPromise<void>();

  const deps = getTsReloadDirectorDeps(prov, {
    scripts: [
      {
        script: getScriptPath("helloTs.ts"),
        autoStart: true,
      },
    ],
  });

  const d = director({
    ...deps,
    onStatusChange: (script: string, status: ScriptStatusTypes) => {
      prov.imp({ script: filterAbsoluteFilepath(script), status });

      return d.shutdown().then(prom.resolve);
    },
  });

  return prom.promise;
};
