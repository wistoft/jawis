import { mainWrapper } from "^jab-node";

//throws in main

mainWrapper("id.", (mainProv) => {
  mainProv.finally(() => console.log("finally done"));
  throw new Error("ups");
});

throw new Error("impossible");
