/* eslint-disable */
import {
  cacheResolveOld,
  clearModuleCache,
  clearResolveCache,
} from "^jab-node";
import { makeExpriment } from "^misc/node";

export default () => {
  // cacheResolveOld();
  // interceptResolve(makeMakeCachedResolve(makeSharedResolveMap()));

  // clearModuleCache();
  // clearResolveCache();

  // //fill resolve cache

  // require("^misc/node");
  clearModuleCache();
  clearResolveCache();

  //start

  // const { printResult, printResultCounts } = makeExpriment({
  //   cacheResolve: false,
  // });
  // //work

  // // require("../_fixture/scripts/hello.js");
  // // require("../_fixture/scripts/helloTs.ts");

  // // require("^jacs");
  // require("^misc/node");
  // // require("^util-javi/node");

  // // require("typescript");

  // // require("deep-equal");

  // printResultCounts();
  // printResult();

  console.log(Object.keys(require.cache).length);

  if (true) {
    console.log(makeExpriment, cacheResolveOld);
  }

  console.log(Object.keys(require.cache).length);
  console.log(Object.keys(require.cache).sort());
};
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
