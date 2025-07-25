const { parentPort, isMainThread } = require("worker_threads");

// - send an ipc message and exit
// - support beeing both process and worker

if (isMainThread) {
  if (!process.send) {
    throw new Error("Ipc should be active in main thread.");
  }

  process.send({ type: "ready" });
} else {
  if (!parentPort) {
    throw new Error("You should be there for me parentPort.");
  }

  parentPort.postMessage({ type: "ready" });
}
