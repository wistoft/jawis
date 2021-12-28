import { mainWrapper } from "^jab-node";

//registers on shutdown

mainWrapper({
  logPrefix: "id",
  main: (mainProv) => {
    setInterval(() => {}, 100); //keep alive

    mainProv.finally(() => console.log("finally done"));
  },
  type: "console",
  registerOnShutdown: true,
});

console.log("after wrapper");

if (process.send) {
  process.send("dummy");
}
