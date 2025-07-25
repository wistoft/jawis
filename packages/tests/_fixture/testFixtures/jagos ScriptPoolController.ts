import { AbsoluteFile, basename } from "^jab";
import { TestProvision } from "^jarun";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "^dev/util";

import {
  ScriptPoolController,
  ScriptPoolControllerDeps,
  ScriptDefinition,
} from "^jagos/internal";

import {
  getLogProv,
  getScriptPath,
  getTestHoneyComb2,
  filterLogEntries,
} from ".";
import { poll } from "^yapu";

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
      scripts: [{ script: getScriptPath("hello.js") }],
      ...extraDeps,
    })
  );

/**
 *
 */
export const getJabScriptPoolController_new = (
  prov: TestProvision,
  extraDeps?: Partial<ScriptPoolControllerDeps>
) =>
  new ScriptPoolController(
    getJabScriptPoolControllerDeps(prov, {
      scripts: [
        { script: "dormitory.bee" as AbsoluteFile },
        { script: "hello.bee" as AbsoluteFile },
        { script: "angry.bee" as AbsoluteFile },
        { script: "message.bee" as AbsoluteFile },
        { script: "ready.bee" as AbsoluteFile },
        { script: "failing.bee" as AbsoluteFile },
        { script: "logging.bee" as AbsoluteFile },
        { script: "graceful.bee" as AbsoluteFile, shutdownTimeout: 100 },
      ],
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
      scripts: [
        { script: getScriptPath("beeSendAndWait.js") },
        { script: getScriptPath("stderrWithExit0.js") },
        { script: getScriptPath("hello.js") },
      ],
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
    scriptFolders: [],
    scripts: [],
    onStatusChange: (script, status) => {
      prov.log(basename(script), status);
    },

    onScriptMessage: (script, msg) => {
      prov.log(basename(script) + ".message", msg);
    },

    onScriptLog: (script, log) => {
      prov.log(basename(script) + ".log", filterLogEntries(log));
    },

    honeyComb: getTestHoneyComb2(),

    showTime: false,

    onError: prov.onError,
    finally: prov.finally,
    logProv,
    getAbsoluteSourceFile,

    ...extraDeps,
  };
};

/**
 *
 */
export const mapScriptFilesToDefault = (scripts: AbsoluteFile[]) =>
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
