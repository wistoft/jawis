import { registerExtension } from "^jab-node";

//print and identity.

registerExtension(".js", (original) => (module, filename) => {
  console.log(filename);

  return original && original(module, filename);
});

require("../_fixture/scripts/hello.js");
