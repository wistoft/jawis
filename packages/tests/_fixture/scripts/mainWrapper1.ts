import { mainWrapper } from "^main-wrapper";

//doesn't register on shutdown

mainWrapper(
  "id",
  (mainProv) => {
    setInterval(() => {}, 100); //keep alive

    mainProv.finally(() => console.log("finally done"));
  },
  "console",
  false
);

console.log("after wrapper");

if (process.send) {
  process.send("dummy");
}
