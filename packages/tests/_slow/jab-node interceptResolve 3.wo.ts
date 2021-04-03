import { clearModuleCache, interceptResolve, Module } from "^jab-node";

//_pathCache is used

interceptResolve((original) => (request, parent, isMain) => {
  const res = original(request, parent, isMain);

  console.log(request, "\n\tresolved to: " + res);

  return res;
});

require("../_fixture/scripts/hello.js");

clearModuleCache();

Module._pathCache[
  "../_fixture/scripts/hello.js\u0000E:\\work\\repos\\jawis\\packages\\tests\\cur"
] = "E:\\work\\repos\\jawis\\packages\\tests\\_fixture\\scripts\\helloTs.ts";

// this file isn't required, but `helloTs`

require("../_fixture/scripts/hello.js");
