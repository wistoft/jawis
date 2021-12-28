import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";
import { filterStackTrace, enableLongTraceForTest } from "^tests/_fixture";

//async/await - promise rejection

//nearly works, but note that typescript converting to generator, when downleveling.

export default async (prov: TestProvision) => {
  enableLongTraceForTest(prov);

  const callback = () => new Error("asdf");

  const err = await Promise.resolve().then(callback);

  const notShown = () => {
    prov.imp(filterStackTrace(unknownToErrorData(err)));
  };

  notShown();
};
