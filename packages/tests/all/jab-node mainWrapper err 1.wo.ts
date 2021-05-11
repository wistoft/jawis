import { mainWrapper } from "^jab-node";

Error.stackTraceLimit = 1; //to avoid noisy in test log

//throws in main

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));

  throw new Error("ups");
});

throw new Error("impossible");
