import { getPromise } from "^yapu";
import { TestProvision } from "^jarun";

import { getNodeProcess } from "../_fixture";

// onError receives something, also when no waiter is active.

export default (prov: TestProvision) => {
  const promExit = getPromise(); //exit must always be called

  getNodeProcess(prov, {
    cwd: "$",
    onError: (error: any) => {
      console.log(error.code);
    },
    onExit: promExit.resolve,
  });

  return promExit.promise;
};
