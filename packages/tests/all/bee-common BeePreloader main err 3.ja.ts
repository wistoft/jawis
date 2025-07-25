import { TestProvision } from "^jarun";

import { getPromise } from "^yapu";
import { getJabBeePreloaderAndDeps, getScriptPath } from "../_fixture";

export default (prov: TestProvision) => {
  const pro = getPromise<void>(); //to avoid registering waiter

  const [pp] = getJabBeePreloaderAndDeps(prov, {
    customBooter: getScriptPath("hello.js"),
    onExit: pro.resolve,
  });

  return pro.promise.then(pp.kill);
};
