import { registerCompile } from "^node-module-hooks-plus";
import { eagerRequire } from "^lazy-require-ts";

//replace loaded code completely

registerCompile(
  ".js",
  (original) => (content, filename) => {
    console.log("ignoring loaded code:", content);

    original("console.log('this is some new code')", filename);
  },
  true
);

eagerRequire(require, "../_fixture/scripts/hello.js");
