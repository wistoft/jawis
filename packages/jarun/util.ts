import { safeAllWait } from "^yapu";
import { JarunTestProvision } from "./internal";

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
