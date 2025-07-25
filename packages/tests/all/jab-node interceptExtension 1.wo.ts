import { basename } from "^jab";
import { registerExtensions } from "^node-module-hooks-plus";
import { eagerRequire } from "^lazy-require-ts";

//print and identity.

registerExtensions(
  [".js"],
  (original) => (module, filename) => {
    console.log(basename(filename));

    return original && original(module, filename);
  },
  true
);

eagerRequire(require, "../_fixture/scripts/hello.js");
