import { TestProvision } from "^jarun";
import { Deps as DirectorDeps } from "^jagos/director";

import { getLogProv, getMainProv, getScriptPath } from ".";

import { ClientComController, ClientComDeps } from "^ts-reload/util";
import { makeMakeJacsWorkerBee } from "^released/jacs";

/**
 *
 */
export const getTsDevDirectorDeps = (
  prov: TestProvision,
  extra?: Partial<DirectorDeps>
) => {
  const mainProv = getMainProv(prov);

  return {
    cacheNodeResolve: true,
    lazyRequire: true,
    enableLongTraces: true,
    alwaysTypeScript: false,
    indexPrefix: true,

    scripts: [
      {
        script: "packages/dev/devServer/devServerMain.ts",
        autoStart: false,
        autoRestart: false,
      },
    ],

    makeMakeJacsWorkerBee: makeMakeJacsWorkerBee as any,
    ...mainProv,
    ...extra,
  };
};

/**
 *
 */
export const getClientComController = (
  prov: TestProvision,
  extra?: Partial<ClientComDeps>
) => {
  const logProv = getLogProv(prov);

  const script = getScriptPath("helloTs.ts");

  const deps = {
    ...logProv,
    indexPrefix: true,
    scripts: [
      {
        script,
        autoStart: true,
        autoRestart: false,
      },
    ],
    ...extra,
  };

  return { deps, cont: new ClientComController(deps) };
};
