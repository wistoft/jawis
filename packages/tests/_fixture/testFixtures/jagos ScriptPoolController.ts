import { TestProvision } from "^jarun";
import { basename } from "^jab";
import { ScriptDefinition } from "^jagos";
import { poll } from "^yapu";
import {
  ScriptPoolController,
  ScriptPoolControllerDeps,
} from "^jagos/ScriptPoolController";

import { getLogProv, getScriptPath, getLiveMakeJacsWorker } from ".";

/**
 *
 */
export const getJabScriptPoolController = (
  prov: TestProvision,
  extraDeps?: Partial<ScriptPoolControllerDeps>
) => new ScriptPoolController(getJabScriptPoolControllerDeps(prov, extraDeps));

/**
 *
 */
export const getJabScriptPoolController_one = (
  prov: TestProvision,
  extraDeps?: Partial<ScriptPoolControllerDeps>
) =>
  new ScriptPoolController(
    getJabScriptPoolControllerDeps(prov, {
      scriptsDefs: mapScriptFilesToDefault([getScriptPath("hello.js")]),
      ...extraDeps,
    })
  );
/**
 *
 */
export const getJabScriptPoolController_many = (
  prov: TestProvision,
  extraDeps?: Partial<ScriptPoolControllerDeps>
) =>
  new ScriptPoolController(
    getJabScriptPoolControllerDeps(prov, {
      scriptsDefs: mapScriptFilesToDefault([
        getScriptPath("beeSendAndWait.js"),
        getScriptPath("stderrWithExit0.js"),
        getScriptPath("hello.js"),
      ]),
      ...extraDeps,
    })
  );

/**
 *
 */
export const getJabScriptPoolControllerDeps = (
  prov: TestProvision,
  extraDeps?: Partial<ScriptPoolControllerDeps>
): ScriptPoolControllerDeps => {
  const logProv = getLogProv(prov);

  return {
    onStatusChange: (script, status) => {
      prov.log(basename(script), status);
    },

    sendProcessStatus: () => {
      //just ignored
    },

    onScriptOutput: (script, output) => {
      prov.log(basename(script) + "." + output.type, output.data);
    },

    onControlMessage: (script, data) => {
      prov.log(basename(script) + ".control", data);
    },

    alwaysTypeScript: true, //development needs typescript for the preloader.

    makeTsBee: getLiveMakeJacsWorker(),

    onError: prov.onError,
    finally: prov.finally,
    logProv,

    ...extraDeps,
  };
};

/**
 *
 */
export const mapScriptFilesToDefault = (scripts: string[]) =>
  scripts.map(
    (script): ScriptDefinition => ({
      script,
    })
  );

/**
 *
 */
export const waitForAllStoppedOrListening = (pool: ScriptPoolController) =>
  poll(
    () =>
      pool
        .getScriptStatus()
        .every(({ status }) => status === "stopped" || status === "listening"),
    100
  );
