import { getPromise, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//not impl - because native error extends Error

declare const notDefined: any;

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);
  const prom = getPromise<void>();
  let err: any;
  setTimeout(function outer() {
    function inner() {
      try {
        const undef = undefined as any;

        notDefined; //ReferenceErrors
        undef.sdf; //TypeError
      } catch (error) {
        err = error;
      }
      prom.resolve();
    }
    inner();
  });
  return prom.promise.then(() => {
    prov.imp("" + err);
    prov.imp(filterStackTrace(unknownToErrorData(err)));
  });
};
