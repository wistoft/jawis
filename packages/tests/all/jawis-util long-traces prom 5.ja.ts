import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { enableLongTraceForTest, filterStackTrace } from "^tests/_fixture";

//promise reject function gets stack trace from its own context.

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  return new Promise<void>((resolve, reject) => {
    const inner = () => {
      reject(new Error("asdf"));
    };
    inner();
  }).catch((err) => {
    prov.imp(filterStackTrace(unknownToErrorData(err)));
  });
};
