import { TestProvision } from "^jarun";
import { safeFinally } from "^yapu";

//finally let the value through

export default (prov: TestProvision) =>
  safeFinally(
    Promise.resolve("howdi"),
    () => {
      console.log("finally value");
    },
    prov.onError
  );
