import { eagerRequire, interceptResolve } from "^jab-node";

//only intercept first time.

interceptResolve((original) => (request, parent, isMain) => {
  console.log(request);

  return original(request, parent, isMain);
});

eagerRequire(require, "../_fixture/scripts/hello.js");
eagerRequire(require, "../_fixture/scripts/hello.js");
//
