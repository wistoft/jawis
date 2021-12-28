import { eagerRequire, plugIntoModuleLoad } from "^jab-node";

//repeated require-calls.

plugIntoModuleLoad(
  (original) =>
    function handler(this, request, parent, isMain) {
      console.log(request);
      return original(request, parent, isMain);
    }
);

eagerRequire(require, "../_fixture/scripts/hello.js");
eagerRequire(require, "../_fixture/scripts/hello.js");
