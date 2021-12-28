import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//promise rejection

export default (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  return Promise.resolve()
    .then(callback)
    .catch((err) => {
      prov.imp(filterStackTrace(unknownToErrorData(err)));
    });
};

// external to get function display name.
const callback = () => {
  const inner = () => {
    throw new Error("asdf");
  };
  inner();
};
