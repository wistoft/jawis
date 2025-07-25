import { plugIntoModuleLoad } from "^node-module-hooks-plus";
import { eagerRequire } from "^lazy-require-ts";

//repeated require-calls.

plugIntoModuleLoad((original) => (request, parent, isMain) => {
  console.log(request);
  return original(request, parent, isMain);
});

eagerRequire(require, "../_fixture/scripts/hello.js");
eagerRequire(require, "../_fixture/scripts/hello.js");
