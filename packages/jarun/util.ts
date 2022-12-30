import { RogueData, TestResult } from "^jates";

import { safeAllWait } from "^yapu";
import { JarunTestProvision, TestProvision } from "./internal";

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
