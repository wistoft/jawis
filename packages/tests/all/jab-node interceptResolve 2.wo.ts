import { clearModuleCache, eagerRequire, interceptResolve } from "^jab-node";
import { filterFilepath } from "^tests/_fixture";

//clearing module cache implicitly clears relativeResolveCache, and resolve is intercepted again.

interceptResolve((original) => (request, parent, isMain) => {
  const res = original(request, parent, isMain);

  console.log(request, "\n\tresolved to: " + filterFilepath(res));

  return res;
});

eagerRequire(require, "../_fixture/scripts/hello.js");

clearModuleCache();

eagerRequire(require, "../_fixture/scripts/hello.js");
