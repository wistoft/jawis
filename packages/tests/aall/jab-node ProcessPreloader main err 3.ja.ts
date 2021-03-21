import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, getScriptPath } from "../_fixture";
import { getPromise } from "^jab";

export default (prov: TestProvision) => {
  const pro = getPromise(); //to avoid registering waiter

  const [pp] = getJabProcessPreloaderAndDeps(prov, {
    customBooter: getScriptPath("hello.js"),
    onExit: pro.resolve,
  });

  return pro.promise.then(pp.kill);
};
