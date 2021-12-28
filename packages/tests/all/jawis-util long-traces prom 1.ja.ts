import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//single promise

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const prom = Promise.resolve();

  return prom.then(function callback() {
    const inner = () => {
      prov.imp(filterStackTrace(unknownToErrorData(new Error())));
    };

    inner();
  });
};
