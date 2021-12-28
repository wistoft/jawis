/* eslint-disable */
const start = Date.now();

import { getViewEntry } from "^tests/_fixture";

// cacheResolveOld();

// clearModuleCache();
// clearResolveCache();

// //fill resolve cache

// require("^misc/node");
// clearModuleCache();
// clearResolveCache();

//start

// const { printResult, printResultCounts } = makeExpriment({
//   cacheResolve: false,
// });

//work

// require("../_fixture/scripts/hello.js");
// require("../_fixture/scripts/helloTs.ts");

// require("^jacs");
// require("^misc/node");
// require("^util-javi/node");

// require("../_fixture");

// require("typescript");

// require("deep-equal");

// printResultCounts();
// printResult();
//

// console.log(Object.keys(require.cache));

console.log(Object.keys(require.cache).length);
// console.log(Object.keys(require.cache).sort());

if (true) {
  // console.log(makeExpriment);
  // console.log(cacheResolveOld);
  console.log(getViewEntry);
}

console.log("time: ", Date.now() - start);
console.log(Object.keys(require.cache).length);
console.log(Object.keys(require.cache).sort());

//
