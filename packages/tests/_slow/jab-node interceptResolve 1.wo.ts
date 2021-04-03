import { interceptResolve } from "^jab-node";

//only intercept first time.

interceptResolve((original) => (request, parent, isMain) => {
  const res = original(request, parent, isMain);

  console.log(request, "\n\tresolved to: " + res);

  return res;
});

require("../_fixture/scripts/hello.js");
require("../_fixture/scripts/hello.js");
