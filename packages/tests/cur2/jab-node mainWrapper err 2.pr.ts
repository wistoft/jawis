import { prej } from "^jab";
import { mainWrapper } from "^jab-node";

//throws in promise

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));
  prej("ups");
});

console.log("sync done");
