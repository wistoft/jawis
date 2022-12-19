import { TestProvision } from "^jarun";
import { safeFinally } from "^yapu";

//error only in source-promise

export default (prov: TestProvision) =>
  safeFinally(
    Promise.reject(new Error("hov")),
    () => {
      console.log("finally value");
    },
    prov.onError
  );
