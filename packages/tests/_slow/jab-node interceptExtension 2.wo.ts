import { registerExtension } from "^jab-node";

//replace completely with custom code. Don't even load the file.

registerExtension(".js", () => (module, filename) =>
  module._compile("console.log('custom code')", filename)
);

require("../_fixture/scripts/hello.js");
