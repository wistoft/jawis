const { Worker, isMainThread, parentPort } = require("worker_threads");

if (isMainThread) {
  const sharedUint8Array = new Int32Array(new SharedArrayBuffer(4));

  const worker = new Worker(__filename, {
    workerData: "hello",
  });
  worker.on("message", (data) => {
    console.log("message", data);
    console.log(sharedUint8Array[0]);
  });
  worker.on("error", (error) => {
    console.log("error", error);
  });
  worker.on("exit", (code) => {
    if (code !== 0)
      console.log("error", `Worker stopped with exit code ${code}`);
    else console.log("clean exit");
  });

  worker.postMessage(sharedUint8Array);

  const val = Atomics.wait(sharedUint8Array, 0, 0);

  console.log(val);
  console.log(sharedUint8Array[0]);
} else {
  parentPort.once("message", (value) => {
    Atomics.store(value, 0, 14);
    Atomics.notify(value, 0);
  });
}
//
