// eslint-disable-next-line
import { makeMakeJacsWorkerBee } from "@jawis/jacs";
import { TestProvision } from "^jarun";

import {
  ClientComController,
  ClientComDeps,
  DirectorDeps,
} from "^ts-reload/util";

import { getLogProv, getMainProv, getScriptPath } from ".";

/**
 *
 */
export const getTsReloadDirectorDeps = (
  prov: TestProvision,
  extra?: Partial<DirectorDeps>
): DirectorDeps => {
  const mainProv = getMainProv(prov);

  return {
    cacheNodeResolve: true,
    lazyRequire: true,
    enableLongTraces: true,
    module: "commonjs",
    indexPrefix: true,

    scripts: [
      {
        script: "packages/dev/devServer/devServerMain.ts",
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
