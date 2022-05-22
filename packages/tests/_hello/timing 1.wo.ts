import { clearModuleCache, clearResolveCache } from "^jab-node";
import { makeExpriment } from "^misc/node";

// require("v8-compile-cache"); //impure

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
const t = require("typescript");
console.log(t);
console.log(Date.now() - start);

printResultCounts();
printResult();
console.log(getResult());
//

// console.log(Object.keys(require.cache));
