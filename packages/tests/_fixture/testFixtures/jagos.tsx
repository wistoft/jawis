import path from "path";
import { TestProvision } from "^jarun";
import { ClientMessage, ScriptStatus, ServerMessage } from "^jagoc";
import { director, DirectorDeps } from "^jagos/director";
import { NodeWS } from "^jab-express";

import { getLogProv, getScriptPath, makeJacsWorker, WsPoolMock } from ".";
import { assertNever } from "^jab";

const projectConf = require("../../../../packages/dev/project.conf");

/**
 *
 */
export const getJagosDirector = (
  prov: TestProvision,
  extraDeps?: Partial<DirectorDeps>
) => {
  const d = director({
    projectRoot: "projectRoot",
    alwaysTypeScript: true, //development needs typescript for the preloader.
    makeTsBee: makeJacsWorker,
    onError: prov.onError,
    finally: prov.finally,
    logProv: getLogProv(prov),
    wsPool: new WsPoolMock({
      log: prov.log,
      filterMessage: filterJagosMessage,
    }),
    ...extraDeps,
  });

  //to avoid specifying NodeWs each time.

  const onClientMessage = (
    msg: ClientMessage,
    nws?: NodeWS<ServerMessage, ClientMessage>
  ) => d.onClientMessage(msg, nws || ({ ws: "dummy" } as any));

  return {
    onClientMessage,
  };
};

/**
 *
 */
export const getJagosDirector_with_script = (
  prov: TestProvision,
  extraDeps?: Partial<DirectorDeps>
) =>
  getJagosDirector(prov, {
    scripts: [{ script: getScriptPath("hello.js") }],
    ...extraDeps,
  });

/**
 *
 */
export const filterJagosMessage = (msg: ServerMessage) => {
  switch (msg.type) {
    case "processStatus": {
      return {
        ...msg,
        data: filterScriptStatuses(msg.data),
      };
    }
    case "stdout":
    case "stderr":
      return {
        ...msg,
        script: path.relative(projectConf.projectRoot, msg.script).replace(/\\/g, "/"), // prettier-ignore
      };

    case "control":
    case "message":
      return msg;

    default:
      throw assertNever(msg, "Unknown server message.");
  }
};

/**
 *
 */
export const filterScriptStatuses = (data: ScriptStatus[]) =>
  data.map((status) => {
    const newStatus = {
      ...status,
      script: path.relative(projectConf.projectRoot, status.script).replace(/\\/g, "/"), // prettier-ignore
    };

    if ("id" in newStatus) {
      newStatus.id = "filtered";
    }

    return newStatus;
  });
