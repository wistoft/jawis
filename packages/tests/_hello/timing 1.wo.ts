import { clearModuleCache, clearResolveCache } from "^jab-node";
import { makeExpriment } from "^misc/node";

clearModuleCache();
clearResolveCache();

//fill resolve cache

// require("../_fixture");
// clearModuleCache();
// clearResolveCache();

//start

const { printResult } = makeExpriment({ cacheResolve: false });

//work

// require("../_fixture/scripts/hello.js");
// require("../_fixture/scripts/helloTs.ts");

// require("^jacs");

require("../_fixture");

// require("typescript");

// require("deep-equal");

printResult();
//
