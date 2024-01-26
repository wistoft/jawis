const { parentPort } = require("worker_threads");
const path = require("path");
const os = require("os");

// - require files, so WPP can change them, and test its reloading.

const library = require(path.join(os.tmpdir(), "jawis-tests-scratchFolder/FileThatChanges")); // prettier-ignore
const library2 = require(path.join(os.tmpdir(), "jawis-tests-scratchFolder/FileThatChanges2")); // prettier-ignore

//values that can change in files. Using message instead of console.log, makes it possible to synchronize on this info.

parentPort.postMessage("library value: " + library);
parentPort.postMessage("library2 value: " + library2);
