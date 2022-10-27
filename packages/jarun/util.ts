import { RogueData, TestResult } from "^jatec";
import { FinallyFunc, safeAllWait } from "^jab";
import { CreateTestRunners } from "^jates";

import { JarunTestProvision, TestProvision } from "./JarunTestProvision";
import { BeeRunner } from "./BeeRunner";
import { JarunProcessController } from ".";
import { makeTsNodeJabProcess } from "^util-javi/node";
import { MakeJabProcess, makeMakeTsJabProcessConditonally } from "^jab-node";

export type TestFunction = (prov: TestProvision) => unknown;

export type TestFileExport = TestFunction | { default: TestFunction };

export type SetTimeoutFunction = (
  callback: (...args: any[]) => void,
  ms: number,
  ...args: any[]
) => NodeJS.Timeout;

/**
 *
 */
export type JarunProcessMessage =
  | {
      type: "testDone";
      value: TestResult;
    }
  | {
      type: "rogue";
      value: RogueData;
    };

/**
 *
 */
export type JarunProcessControllerMessage =
  | {
      type: "run";
      id: string;
      file: string;
    }
  | {
      type: "shutdown";
    };

/**
 * - catch errors and report them to test provision, instead of just writing to console.
 */
export const createJarunSetTimeout =
  (
    prov: JarunTestProvision,
    orgSetTimeout: SetTimeoutFunction
  ): SetTimeoutFunction =>
  (callback: (...args: any[]) => void, ms: number, ...args: any[]) =>
    orgSetTimeout(
      (...innerArgs) => {
        try {
          callback(...innerArgs);
        } catch (a) {
          const error = a as unknown;
          prov.onError(error, ["uh-exception in setTimeout"]);
        }
      },
      ms,
      ...args
    );

/**
 * Recursively await the promises in the test provition.
 */
export const awaitPromises = (prov: JarunTestProvision): Promise<undefined> => {
  const tmp = prov.awaitPromises;

  prov.awaitPromises = []; //clear, so we can detect if more promises are made.

  return safeAllWait(tmp, prov.onError)
    .catch(() => {
      /* ignore this rejection, the error is reported by `safeAllWait` */
    })
    .then(() => {
      if (prov.awaitPromises.length !== 0) {
        return awaitPromises(prov);
      }
    });
};

/**
 *
 */
export const makeProcessRunner = (deps: {
  makeTsProcess: MakeJabProcess;
  finally: FinallyFunc;
}) => {
  const makeTsProcessConditonally = makeMakeTsJabProcessConditonally(
    deps.makeTsProcess
  );

  return new BeeRunner({
    ...deps,
    makeBee: makeTsProcessConditonally,
  });
};

/**
 *
 */
export const getDefaultRunnersAssignments = (
  jpc: JarunProcessController,
  pr: BeeRunner,
  wo: BeeRunner
) => ({
  ".ja.js": jpc,
  ".ja.ts": jpc,
  ".ja.jsx": jpc,
  ".ja.tsx": jpc,
  ".pr.js": pr,
  ".pr.ts": pr,
  ".wo.js": wo,
  ".wo.ts": wo,
});

/**
 *
 */
export const createDefaultTestRunners: CreateTestRunners = (deps) => {
  const jpc = new JarunProcessController(deps);

  const pr = makeProcessRunner({
    ...deps,
    makeTsProcess: makeTsNodeJabProcess,
  });

  const wo = new BeeRunner({
    ...deps,
    makeBee: deps.makeTsBee,
  });

  return getDefaultRunnersAssignments(jpc, pr, wo);
};
