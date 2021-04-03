import { plugIntoModuleLoad } from "^jab-node";

//print repeated require calls.

plugIntoModuleLoad(
  (original) =>
    function handler(this, request, parent, isMain) {
      console.log(request);
      return original(request, parent, isMain);
    }
);

require("../_fixture/scripts/hello.js");
require("../_fixture/scripts/hello.js");
