import { prej } from "^jab";
import { mainWrapper } from "^jab-node";

Error.stackTraceLimit = 1; //to avoid noisy in test log

//throws in promise

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));
  prej("ups");
});

console.log("sync done");
