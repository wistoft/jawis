import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//promise created in promise

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  function inner() {
    const last = () => {
      prov.imp(filterStackTrace(unknownToErrorData(new Error())));
    };

    last();
  }

  return Promise.resolve().then(function outer() {
    return Promise.resolve().then(inner);
  });
};
