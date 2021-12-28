import { eagerRequire, registerCompile } from "^jab-node";

//replace loaded code completely

registerCompile(".js", (original) => (content, filename) => {
  console.log("ignoring loaded code:", content);

  original("console.log('this is some new code')", filename);
});

eagerRequire(require, "../_fixture/scripts/hello.js");
