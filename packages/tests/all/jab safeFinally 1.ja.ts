import { TestProvision } from "^jarun";
import { safeFinally } from "^jab";

//finally let the value through

export default (prov: TestProvision) =>
  safeFinally(
    Promise.resolve("howdi"),
    () => {
      console.log("finally value");
    },
    prov.onError
  );
