import { TestProvision } from "^jarun";
import { safeFinally } from "^jab";

//error in both source-promise and finally-function

export default (prov: TestProvision) =>
  safeFinally(
    Promise.reject(new Error("hov")),
    () => {
      console.log("finally value");
      return Promise.reject(new Error("dav"));
    },
    prov.onError
  );
