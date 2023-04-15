import { RogueData, TestResult } from "^jatec";

import { safeAllWait } from "^yapu";
import { JarunTestProvision, TestProvision } from "./internal";

export type TestFunction = (prov: TestProvision) => unknown;

export type TestFileExport = TestFunction | { default: TestFunction };

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
