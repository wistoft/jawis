import { clearModuleCache, interceptResolve } from "^node-module-hooks-plus";
import { eagerRequire } from "^lazy-require-ts";

//clearing module cache implicitly clears relativeResolveCache, and resolve is intercepted again.

interceptResolve((original) => (request, parent, isMain) => {
  console.log(request);

  return original(request, parent, isMain);
});

eagerRequire(require, "../_fixture/scripts/hello.js");

clearModuleCache();

eagerRequire(require, "../_fixture/scripts/hello.js");
