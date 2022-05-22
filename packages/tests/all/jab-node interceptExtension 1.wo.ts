import { basename } from "^jab";
import { eagerRequire, registerExtension } from "^jab-node";

//print and identity.

registerExtension(".js", (original) => (module, filename) => {
  console.log(basename(filename));

  return original && original(module, filename);
});

eagerRequire(require, "../_fixture/scripts/hello.js");
