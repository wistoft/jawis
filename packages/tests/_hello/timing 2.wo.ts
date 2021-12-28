import {
  cacheResolveOld,
  clearModuleCache,
  clearResolveCache,
} from "^jab-node";
import { makeExpriment } from "^misc/node";

cacheResolveOld();

clearModuleCache();
clearResolveCache();

//fill resolve cache

require("^util-javi/node");
clearModuleCache();
clearResolveCache();

//start

const { printResult, printResultCounts } = makeExpriment({
  cacheResolve: false,
});

//work

// require("../_fixture/scripts/hello.js");
// require("../_fixture/scripts/helloTs.ts");

// require("^jacs");
// require("^misc/node");
require("^util-javi/node");

// require("../_fixture");

// require("typescript");

// require("deep-equal");

printResultCounts();
printResult();
//

// console.log(Object.keys(require.cache));
