import path from "path";

import { BeeDeps, RequireSenderMessage } from "^jab-node";

import { getScriptPath, TestMainProv } from ".";

const projectConf = require("../../../../packages/dev/project.conf");

export const getBeeDeps = (
  prov: TestMainProv,
  extraDeps?: Partial<BeeDeps<any>>,
  logPrefix = "bee."
): BeeDeps<any> => ({
  filename: getScriptPath("hello.js"),
  onMessage: (msg: unknown) => {
    prov.log(logPrefix + "message", msg);
  },
  onStdout: (data: Buffer) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },
  onStderr: (data: Buffer) => {
    prov.logStream(logPrefix + "stderr", data.toString());
  },
  onExit: () => {},
  onError: prov.onError,
  finally: prov.finally,
  ...extraDeps,
});

/**
 *
 */
export const logRequireMessage = (msg: RequireSenderMessage) => {
  console.log({
    ...msg,
    file: path
      .relative(projectConf.packageFolder, msg.file)
      .replace(/\\/g, "/"),
    source:
      msg.source &&
      path.relative(projectConf.packageFolder, msg.source).replace(/\\/g, "/"),
  });
};
