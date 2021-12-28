import { eagerRequire, interceptResolve } from "^jab-node";
import { filterFilepath } from "^tests/_fixture";

//only intercept first time.

interceptResolve((original) => (request, parent, isMain) => {
  const res = original(request, parent, isMain);

  console.log(request, "\n\tresolved to: " + filterFilepath(res));

  return res;
});

eagerRequire(require, "../_fixture/scripts/hello.js");
eagerRequire(require, "../_fixture/scripts/hello.js");
