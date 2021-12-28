import { getPromise, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//single nested setTimeout

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const prom = getPromise<void>();

  setTimeout(() => {
    prov.imp(filterStackTrace(unknownToErrorData(new Error())));
    prom.resolve();
  }, 0);

  return prom.promise;
};
