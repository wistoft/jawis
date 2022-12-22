import { TestProvision } from "^jarun";
import { basename } from "^jab";
import { ScriptDefinition } from "^jagos";
import { ScriptPoolController, Deps } from "^jagos/ScriptPoolController";

import { getLogProv, getScriptPath, makeJacsWorker } from ".";

/**
 *
 */
export const getJabScriptPoolController = (
  prov: TestProvision,
  extraDeps?: Partial<Deps>
) => new ScriptPoolController(getJabScriptPoolControllerDeps(prov, extraDeps));

/**
 *
 */
export const getJabScriptPoolController_one = (
  prov: TestProvision,
  extraDeps?: Partial<Deps>
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
  extraDeps?: Partial<Deps>
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
  extraDeps?: Partial<Deps>
): Deps => {
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

    makeTsBee: makeJacsWorker,

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
