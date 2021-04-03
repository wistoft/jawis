import { clearModuleCache, interceptResolve } from "^jab-node";

//clear module cache implicit clears relativeResolveCache, and resolve is intercepted again.

interceptResolve((original) => (request, parent, isMain) => {
  const res = original(request, parent, isMain);

  console.log(request, "\n\tresolved to: " + res);

  return res;
});

require("../_fixture/scripts/hello.js");

clearModuleCache();

require("../_fixture/scripts/hello.js");
