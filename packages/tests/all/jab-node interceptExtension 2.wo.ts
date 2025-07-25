import { registerExtensions } from "^node-module-hooks-plus";
import { eagerRequire } from "^lazy-require-ts";

//replace completely with custom code. Don't even load the file.

registerExtensions(
  [".js"],
  () => (module, filename) =>
    module._compile("console.log('custom code')", filename),
  true
);

eagerRequire(require, "../_fixture/scripts/hello.js");
