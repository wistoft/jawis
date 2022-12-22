import {
  TestProvision,
  JarunProcessControllerDeps,
  JarunProcessController,
} from "^jarun";
import { RogueData } from "^jatec";
import { then } from "^yapu";
import {
  JarunProcessControllerInner,
  JarunProcessControllerInnerDeps,
} from "^jarun/JarunProcessControllerInner";

import { getLogProv, makeDormentInMemoryBee } from ".";

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

  onRequire: () => {},

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

  makeTsBee: makeDormentInMemoryBee,
  onError: prov.onError,
  finally: prov.finally,

  ...extraDeps,
});
