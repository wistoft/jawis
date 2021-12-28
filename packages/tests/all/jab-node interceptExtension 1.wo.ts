import { eagerRequire, registerExtension } from "^jab-node";
import { filterFilepath } from "^tests/_fixture";

//print and identity.

registerExtension(".js", (original) => (module, filename) => {
  console.log(filterFilepath(filename));

  return original && original(module, filename);
});

eagerRequire(require, "../_fixture/scripts/hello.js");
