import { looping } from "^yapu";
import { TestProvision } from "^jarun";

// sync throw in second makePromise

export default (prov: TestProvision) =>
  looping([1, 2], (int) => {
    if (int === 1) {
      return Promise.resolve();
    } else {
      throw new Error("ups. didn't make promise");
    }
  });
