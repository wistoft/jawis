import { TestProvision } from "^jarun";
import { safeFinally } from "^jab";

//error only in finally-function

export default (prov: TestProvision) =>
  safeFinally(
    Promise.resolve("howdi"),
    () => {
      console.log("finally value");
      throw new Error("dav");
    },
    prov.onError
  );
