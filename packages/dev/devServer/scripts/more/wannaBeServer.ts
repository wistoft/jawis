import { JabShutdownMessage, registerOnMessage } from "^jab-node";

registerOnMessage((msg: JabShutdownMessage) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;
    default:
      throw new Error("Unknown message." + msg);
  }
});

console.log("wanna be server");
