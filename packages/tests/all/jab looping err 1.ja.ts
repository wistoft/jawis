import { looping } from "^yapu";
import { TestProvision } from "^jarun";

// sync throw in first makePromise

export default (prov: TestProvision) =>
  looping([1], () => {
    throw new Error("ups. didn't make promise");
  });
