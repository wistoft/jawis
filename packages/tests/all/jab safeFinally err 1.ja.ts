import { TestProvision } from "^jarun";
import { safeFinally } from "^yapu";

//error in both source-promise and finally-function

export default (prov: TestProvision) =>
  safeFinally(
    Promise.reject(new Error("hov")),
    () => {
      console.log("finally value");
      throw new Error("dav");
    },
    prov.onError
  );
