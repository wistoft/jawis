import { mainWrapper } from "^jab-node";

//doesn't register on shutdown

mainWrapper({
  logPrefix: "id",
  main: (mainProv) => {
    setInterval(() => {}, 100); //keep alive

    mainProv.finally(() => console.log("finally done"));
  },
  type: "console",
  registerOnShutdown: false,
});

console.log("after wrapper");

if (process.send) {
  process.send("dummy");
}
