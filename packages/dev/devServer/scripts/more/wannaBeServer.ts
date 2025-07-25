import { BeeShutdownMessage } from "^bee-common";
import { MainProv, registerOnMessage } from "^jab-node";
import { mainWrapper } from "^main-wrapper";

setTimeout(() => {
  console.log("hello");
});

const main = (mainProv: MainProv) => {
  registerOnMessage((msg: BeeShutdownMessage) => {
    switch (msg.type) {
      case "shutdown":
        process.exit();
        break;
      default:
        throw new Error("Unknown message." + msg);
    }
  });

  mainProv.log("wanna be server");
};

mainWrapper({
  logPrefix: "Dev.",
  main,
});
