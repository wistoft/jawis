import { TestProvision } from "^jarun";
import { mergeOldAndNewLogs, UiEntry } from "^console/internal";

export default (prov: TestProvision) => {
  prov.log("both empty", mergeOldAndNewLogs([], []));

  prov.log("log and empty", mergeOldAndNewLogs([logEntry], []));
  prov.log("empty and log", mergeOldAndNewLogs([], [logEntry]));

  prov.log("empty and stdout", mergeOldAndNewLogs([], [stdoutEntry]));
  prov.log("stdout and empty", mergeOldAndNewLogs([stdoutEntry], []));

  prov.log("stdout and stdout2", mergeOldAndNewLogs([stdoutEntry], [stdoutEntry2])); // prettier-ignore
  prov.log("stdout and stderr", mergeOldAndNewLogs([stdoutEntry], [stderrEntry])); // prettier-ignore

  prov.log("stdout and stderr, stdout", mergeOldAndNewLogs([stdoutEntry], [stderrEntry, stdoutEntry2])); // prettier-ignore
  prov.log("stderr and stdout, stdout2", mergeOldAndNewLogs([stderrEntry], [stdoutEntry, stdoutEntry2])); // prettier-ignore

  prov.log("stdout from different context", mergeOldAndNewLogs([], [stdoutEntry, stdoutEntry3])); // prettier-ignore
};

const logEntry: UiEntry = {
  id: 1,
  type: "log",
  context: "browser",
  logName: "myLog",
  data: [null],
};

const stdoutEntry: UiEntry = {
  id: 2,
  type: "stream",
  context: "browser",
  logName: "stdout",
  data: "out1",
};

const stdoutEntry2: UiEntry = {
  id: 3,
  type: "stream",
  context: "browser",
  logName: "stdout",
  data: "out2",
};

const stdoutEntry3: UiEntry = {
  id: 4,
  type: "stream",
  context: "server", //other context
  logName: "stdout",
  data: "out3",
};

const stderrEntry: UiEntry = {
  id: 5,
  type: "stream",
  context: "browser",
  logName: "stderr", //other logName
  data: "ups",
};
