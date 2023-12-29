import path from "path";
import { TestProvision } from "^jarun";
import { ClientMessage, ScriptStatus, ServerMessage } from "^jagoc";
import { NodeWS } from "^jab-express";
import { assertNever, basename, FileService } from "^jab";
import { director, DirectorDeps } from "^jagos/director";

import {
  getLogProv,
  getScriptPath,
  getLiveMakeJacsWorker,
  WsPoolMock,
} from ".";

const projectConf = require("../../../../packages/dev/project.conf");

/**
 *
 */
export const getJagosDirector = (
  prov: TestProvision,
  extraDeps?: Partial<DirectorDeps>
) => {
  const fileService: FileService = {
    handleOpenFileInEditor: () => {},
    handleOpenRelativeFileInEditor: () => {},
    compareFiles: () => {},
  };

  const wsPool = new WsPoolMock<ServerMessage, ClientMessage>({
    log: prov.log,
    filterMessage: filterJagosMessage,
  });

  const d = director({
    alwaysTypeScript: true, //development needs typescript for the preloader.
    makeTsBee: getLiveMakeJacsWorker(),
    onError: prov.onError,
    finally: prov.finally,
    logProv: getLogProv(prov),
    wsPool: {
      ...wsPool,
      send: (_data) => {
        const data = filterJagosMessage(_data);

        if ("script" in data) {
          //scripts are logged separately, because their output isn't deterministic
          prov.log(basename(data.script), data);
        } else {
          prov.log("WsPoolMock.send", data);
        }
      },
    },
    ...fileService,
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
