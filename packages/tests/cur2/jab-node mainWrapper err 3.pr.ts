import { mainWrapper, UserMessage } from "^jab-node";

//only user message is shown

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));
  throw new UserMessage("you made an error, not the system.");
});
