import { mainWrapper } from "^jab-node";

//hello

mainWrapper({
  logPrefix: "id",
  main: (mainProv) => {
    mainProv.log("hello wrapper");
    mainProv.finally(() => console.log("finally done"));
  },
});

console.log("after wrapper");
