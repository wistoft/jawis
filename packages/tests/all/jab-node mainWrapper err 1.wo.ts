import { mainWrapper } from "^main-wrapper";
import { getErrorForPrint } from "^tests/_fixture";

Error.stackTraceLimit = 1; //to avoid noise in test log

//throws in main

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));
  throw getErrorForPrint();
});

throw new Error("impossible");
