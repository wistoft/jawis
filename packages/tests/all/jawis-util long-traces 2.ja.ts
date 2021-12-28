import { getPromise, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//double nested setTimeout

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const prom = getPromise<void>();

  setTimeout(() => {
    //`inner` function: to get a stack frame in this scope
    const inner = () => {
      setTimeout(() => {
        prov.imp(filterStackTrace(unknownToErrorData(new Error())));

        prom.resolve();
      }, 0);
    };

    inner();
  }, 0);

  return prom.promise;
};
