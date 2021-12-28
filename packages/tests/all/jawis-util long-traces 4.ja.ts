import { getPromise, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

// Error trace requested in child context. But trace still reflects parent context.

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const prom = getPromise<void>();
  prov.await(prom.promise);

  setTimeout(() => {
    const err = new Error("asdf");

    setTimeout(() => {
      prov.imp(filterStackTrace(unknownToErrorData(err)));
      prom.resolve();
    });
  });

  return prom.promise;
};
