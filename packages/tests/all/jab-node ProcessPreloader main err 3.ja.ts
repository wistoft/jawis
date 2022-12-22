import { TestProvision } from "^jarun";

import { getPromise } from "^yapu";
import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";

export default (prov: TestProvision) => {
  const pro = getPromise(); //to avoid registering waiter

  const [pp] = getJabProcessPreloaderAndDeps(prov, {
    customBooter: getScriptPath("hello.js"),
    onExit: pro.resolve,
  });

  return pro.promise.then(pp.kill);
};
