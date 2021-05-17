import { mainWrapper } from "^jab-node";

Error.stackTraceLimit = 1; //to avoid noisy in test log

//error thrown by native node.

mainWrapper("id.", () => {
  require("dontExist");
});
