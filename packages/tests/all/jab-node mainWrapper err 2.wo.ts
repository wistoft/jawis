import { mainWrapper } from "^jab-node";
import { getErrorForPrint } from "^tests/_fixture";

Error.stackTraceLimit = 1; //to avoid noise in test log

//throws in promise

mainWrapper({
  logPrefix: "id.",
  main: (mainProv) => {
    mainProv.finally(() => console.log("finally done"));

    Promise.reject(getErrorForPrint());
  },
});

console.log("sync done");
