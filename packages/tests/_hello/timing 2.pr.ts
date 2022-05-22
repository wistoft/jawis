import { clearModuleCache, clearResolveCache } from "^jab-node";
import { makeExpriment } from "^misc/node";

require("E:/work/repos/v8-compile-cache"); //impure

// cacheResolveOld();

clearModuleCache();
clearResolveCache();

//fill resolve cache

// require("^util-javi/node");
// clearModuleCache();
// clearResolveCache();

//start

const { printResult, printResultCounts, getResult } = makeExpriment({
  cacheResolve: false,
});

//work

// require("../_fixture");

const start = Date.now();
require("typescript");
console.log(Date.now() - start);

printResultCounts();
printResult();
// console.log(getResult());
//

// console.log(Object.keys(require.cache));
