import { mainWrapper } from "^main-wrapper";

//hello

mainWrapper("id", (mainProv) => {
  mainProv.log("hello wrapper");
  mainProv.finally(() => console.log("finally done"));
});

console.log("after wrapper");
