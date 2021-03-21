const { parentPort, isMainThread } = require("worker_threads");

// - send an ipc message
// - register listener, so the script don't exit by it self.
// - support beeing both process and worker

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

if (isMainThread) {
  if (!process.send) {
    throw new Error("Ipc should be active in main thread.");
  }

  process.on("message", onMessage);

  process.send({ type: "msg", value: "hello" });
} else {
  if (!parentPort) {
    throw new Error("You should be there for me parentPort.");
  }

  parentPort.on("message", onMessage);

  parentPort.postMessage({ type: "msg", value: "hello" });
}
