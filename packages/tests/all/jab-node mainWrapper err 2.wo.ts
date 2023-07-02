import { mainWrapper } from "^main-wrapper";
import { getErrorForPrint } from "^tests/_fixture";

Error.stackTraceLimit = 1; //to avoid noisy in test log

//throws in promise

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));

  Promise.reject(getErrorForPrint());
});

console.log("sync done");
