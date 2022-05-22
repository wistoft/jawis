import { mainWrapper, makeUserMessage } from "^jab-node";

//only user message is shown, not stack.

mainWrapper({
  logPrefix: "id.",
  main: (mainProv) => {
    mainProv.finally(() => console.log("finally done"));
    throw makeUserMessage("you made an error, not the system.");
  },
});
