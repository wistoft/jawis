import { then } from "^yapu";
import { RogueData } from "^jatec";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "^dev/util";

import {
  TestProvision,
  JarunProcessControllerDeps,
  JarunProcessController,
  JarunProcessControllerInner,
  JarunProcessControllerInnerDeps,
} from "^jarun/internal";

import { ProcessRestarter } from "^process-util/internal";
import { getLogProv, makeDormentInMemoryBee, makeOnLog } from ".";

/**
 *
 */
export const getJpcInner = (
  prov: TestProvision,
  extraDeps?: Partial<JarunProcessControllerInnerDeps>
) =>
  new JarunProcessControllerInner(
    getJarunProcessControllerInnerDeps(prov, "jpcInner.", extraDeps)
  );

/**
 *
 */
export const getJarunProcessControllerInnerDeps = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<JarunProcessControllerInnerDeps>
): JarunProcessControllerInnerDeps => ({
  onRogueTest: (rogue: RogueData) => {
    prov.log(logPrefix + "onRogueTest", rogue);
  },

  prSend: (msg) =>
    then(() => {
      prov.imp("prSend", msg);
    }),

  onError: prov.onError,

  logProv: getLogProv(prov, logPrefix),

  ...extraDeps,
});

/**
 *
 */
export const getJarunProcessController = (
  prov: TestProvision,
  extraDeps?: Partial<JarunProcessControllerDeps>
) =>
  new JarunProcessController(
    getJarunProcessControllerDeps(prov, "jarunProcess.", extraDeps)
  );

/**
 *
 */
export const getJarunProcessControllerDeps = (
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<JarunProcessControllerDeps>
): JarunProcessControllerDeps => ({
  ...getJarunProcessControllerInnerDeps(prov, logPrefix, prov),

  onLog: makeOnLog(prov),

  makeProcessRestarter: (deps) =>
    new ProcessRestarter({ ...deps, makeBee: makeDormentInMemoryBee }),

  getAbsoluteSourceFile,

  onError: prov.onError,
  finally: prov.finally,

  ...extraDeps,
});
