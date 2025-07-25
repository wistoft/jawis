const { parentPort, isMainThread } = require("worker_threads");

const onMessage = (msg) => {
  switch (msg.type) {
    case "shutdown":
      process.exit();
      break;

    default:
      throw new Error("helloIpc.js : Unknown message." + msg);
  }
};

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
