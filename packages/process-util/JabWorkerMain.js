const cp = require("child_process");
const { parentPort } = require("worker_threads");

let originalSpawn = cp.spawn;

/**
 * Send pids to parent.
 */
cp.spawn = (...args) => {
  const proc = originalSpawn(...args);

  parentPort.postMessage({
    channel: "jab_worker_channel_token",
    pid: proc.pid,
  });

  return proc;
};
