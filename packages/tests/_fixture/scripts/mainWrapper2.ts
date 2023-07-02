import { mainWrapper } from "^main-wrapper";

//registers on shutdown

mainWrapper(
  "id",
  (mainProv) => {
    setInterval(() => {}, 100); //keep alive

    mainProv.finally(() => console.log("finally done"));
  },
  "console",
  true
);

console.log("after wrapper");

if (process.send) {
  process.send("dummy");
}
