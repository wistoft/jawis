import { BeeShutdownMessage } from "^bee-common";
import { registerOnMessage } from "^jab-node";

registerOnMessage((msg: BeeShutdownMessage) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;
    default:
      throw new Error("Unknown message." + msg);
  }
});

console.log("wanna be server");
