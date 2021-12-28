import { JabShutdownMessage } from "^jabc";
import { MainProv, mainWrapper } from "^jab-node";
import { registerOnMessage } from "^jab";

//no rejection handlers, because jago does that, and it always manages this script.

setTimeout(() => {
  throw new Error("ups");
});

const main = (mainProv: MainProv) => {
  registerOnMessage((msg: JabShutdownMessage) => {
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

// mainWrapper("Dev.", main, "jago", true, false);

mainWrapper({
  logPrefix: "Dev.",
  main,
  type: "jago",
  registerOnShutdown: true,
  doRegisterErrorHandlers: false,
});
