import { TestProvision } from "^jarun";
import {
  interceptResolve,
  makeMakeCachedResolve,
  makeSharedResolveMap,
  TS_TIMEOUT,
} from "^jab-node";
import {
  getBeeDeps,
  getProducer_lazy,
  getProjectPath,
  getScriptPath,
} from "../_fixture";

//send a shared map.

export default (prov: TestProvision) => {
  const resolveMap = makeSharedResolveMap();

  resolveMap.set("fido\x01" + __dirname, getScriptPath("helloTs.ts")); //artificially 'resolved' path

  const bee = getProducer_lazy(prov).makeJacsWorkerBee(
    getBeeDeps(prov, {
      filename: __filename, //use this script as the worker script.
      workerData: resolveMap,
    })
  );

  return bee.waiter.await("stopped", 2 * TS_TIMEOUT).then(() => {
    //the resolved paths are available here now.
    const res = resolveMap
      .map((v: any, k: any) => {
        return {
          key: k.replace(__dirname, ""),
          value: v.replace(getProjectPath(), "").replace(/\\/g, "/"),
        };
      })
      .sort((a, b) => (a.key < b.key ? -1 : 1));

    console.log(res);
  });
};

/**
 * Called in the worker.
 */
export const main = ({ workerData: resolveMap }: any) => {
  //use cache

  interceptResolve(makeMakeCachedResolve(resolveMap));

  //try it

  eval("require.eager || require")(getScriptPath("hello.js")); //an unknown path is resolved automatically.
  eval("require.eager || require")("fido");
  eval("require.eager || require")("fs");
  eval("require.eager || require")("builtin-modules"); //only things in node_modules should be cached
};
