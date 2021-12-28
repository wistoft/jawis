import fs from "fs";
import { getPromise, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//native async callbacks.

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const prom = getPromise<void>();

  const outer = () => {
    fs.stat("asdf", function inner() {
      const last = () => {
        prov.imp(filterStackTrace(unknownToErrorData(new Error())));
        prom.resolve();
      };

      last();
    });
  };

  outer();

  return prom.promise;
};
