import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//promise resolve function isn't included any where. Because it's not part of the stack.

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  return new Promise<void>((resolve) => {
    const func = () => {
      resolve();
    };
    func();
  }).then(function callback() {
    prov.imp(filterStackTrace(unknownToErrorData(new Error("ups"))));
  });
};
