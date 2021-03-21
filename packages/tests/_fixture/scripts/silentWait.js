process.on("message", (msg) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;

    default:
      throw new Error("helloIpc.js : Unknown message." + msg);
  }
});
