import { getPromise, makeJabError, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

// Error trace request in later context. But still Retains trace from creation context.

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const CustomJabError = makeJabError(); //Make JabError late, because it extends Error, which is monkey patched.

  const prom = getPromise<void>();
  let err: any;
  setTimeout(function outer() {
    function inner() {
      err = new CustomJabError("asdf");
      prom.resolve();
    }
    inner();
  });
  return prom.promise.then(() => {
    prov.imp(filterStackTrace(unknownToErrorData(err)));
  });
};
