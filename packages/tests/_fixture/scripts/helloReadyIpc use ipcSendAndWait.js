//send one message, when ready.

process.on("message", (msg) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;

    default:
      throw new Error("Unknown message." + msg);
  }
});

process.send({ type: "ready" });
