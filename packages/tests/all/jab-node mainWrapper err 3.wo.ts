import { mainWrapper, UserMessage } from "^main-wrapper";

//only user message is shown

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));
  throw new UserMessage("you made an error, not the system.");
});
