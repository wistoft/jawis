import { clearModuleCache, interceptResolve } from "^node-module-hooks-plus";
import { eagerRequire } from "^lazy-require-ts";

//it's possible to uninstall

const uninstall = interceptResolve((original) => (request, parent, isMain) => {
  console.log(request);

  return original(request, parent, isMain);
});

eagerRequire(require, "../_fixture/scripts/hello.js");

clearModuleCache(); // to make node call resolve again.

uninstall();

//Require script again.

eagerRequire(require, "../_fixture/scripts/hello.js"); // callback isn't called here.
