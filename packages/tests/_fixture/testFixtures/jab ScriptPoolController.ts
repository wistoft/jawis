import { TestProvision } from "^jarun";
import { ScriptPoolController, Deps } from "^jagos/ScriptPoolController";
import { mapScriptFilesToDefault } from "^jagos";
import { basename } from "^jab";

import { getLogProv, getScriptPath } from ".";
import { makeJacsWorker } from "../util/diverse jacs compile";

/**
 *
 */
export const getJabScriptPoolController = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<Deps>
) =>
  new ScriptPoolController(
    getJabScriptPoolControllerDeps(prov, logPrefix, extraDeps)
  );

/**
 *
 */
export const getJabScriptPoolController_many = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<Deps>
) => {
  const scripts = [
    getScriptPath("beeSendAndWait.js"),
    getScriptPath("stderrWithExit0.js"),
    getScriptPath("hello.js"),
  ];

  return getJabScriptPoolController(prov, logPrefix, {
    ...extraDeps,
    scriptsDefs: mapScriptFilesToDefault(scripts),
  });
};

/**
 *
 */
export const getJabScriptPoolControllerDeps = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<Deps>
): Deps => {
  const logProv = getLogProv(prov, logPrefix);

  return {
    scriptsDefs: mapScriptFilesToDefault([getScriptPath("hello.js")]),

    onProcessStatusChange: (script, status) => {
      prov.log(logPrefix + basename(script), status);
    },

    onScriptOutput: (script, output) => {
      prov.log(logPrefix + basename(script) + "." + output.type, output.data);
    },

    onControlMessage: (script, data) => {
      prov.log(logPrefix + basename(script) + ".control", data);
    },

    alwaysTypeScript: true, //development needs typescript for the preloader.

    makeTsBee: makeJacsWorker,

    onError: prov.onError,
    finally: prov.finally,
    logProv,

    ...extraDeps,
  };
};
