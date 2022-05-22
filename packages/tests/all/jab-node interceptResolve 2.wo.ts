import { clearModuleCache, eagerRequire, interceptResolve } from "^jab-node";
import { filterFilepath } from "^tests/_fixture";

//clearing module cache implicitly clears relativeResolveCache, and resolve is intercepted again.

filterFilepath("sdf"); //eager load

interceptResolve((original) => (request, parent, isMain) => {
  console.log(request);

  return original(request, parent, isMain);
});

eagerRequire(require, "../_fixture/scripts/hello.js");

clearModuleCache();

eagerRequire(require, "../_fixture/scripts/hello.js");
