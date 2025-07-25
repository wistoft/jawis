// - send an ipc message
// - register listener, so the script don't exit by it self.

const onMessage = (msg) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;

    default:
      throw new Error("Unknown message." + msg);
  }
};

//support beeing both process and worker

module.exports.main = (prov) => {
  prov.beeSend({ type: "msg", value: "hello" });
  prov.registerOnMessage(onMessage);
};
