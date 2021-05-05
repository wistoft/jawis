import path from "path";

import { WsPoolProv } from "^jab-express";
import {
  BeeDeps,
  SocketData,
  NodeWS,
  RequireSenderMessage,
  nodeRequire,
} from "^jab-node";

import { TestProvision } from "^jarun";

import { getScriptPath, TestMainProv } from ".";

const projectConf = require("../../../../project.conf");

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
export class WsPoolMock<MS extends SocketData, MR extends SocketData>
  implements WsPoolProv<MS, MR> {
  constructor(private prov: TestProvision) {}

  public send = (data: MS) => {
    this.prov.log("WsPoolMock", "send");
    this.prov.log("WsPoolMock", data);
  };

  public forAll = (cb: (client: NodeWS<MS, MR>) => void) => {
    this.prov.log("WsPoolMock", "forAll");
    this.prov.log("WsPoolMock", cb);
  };

  public shutdown = () => Promise.resolve();
}

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
