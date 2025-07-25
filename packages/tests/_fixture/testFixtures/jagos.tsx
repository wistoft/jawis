import { assertNever, FileService } from "^jab";
import { TestProvision } from "^jarun";
import { NodeWS } from "^jab-express";
import { getAbsoluteSourceFile_dev as getAbsoluteSourceFile } from "^dev/util";

import {
  ClientMessage,
  ScriptStatus,
  ServerMessage,
  director,
  DirectorDeps,
} from "^jagos/internal";

import {
  filterAbsoluteFilepath,
  getLogProv,
  getScriptPath,
  WsPoolMock,
  getTestHoneyComb2,
} from ".";

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

  const d = director({
    scriptFolders: [],
    scripts: [],
    honeyComb: getTestHoneyComb2(),
    showTime: false,
    onError: prov.onError,
    finally: prov.finally,
    logProv: getLogProv(prov),
    wsPool: new WsPoolMock<ServerMessage, ClientMessage>({
      log: prov.log,
      filterMessage: filterJagosMessage,
    }),
    getAbsoluteSourceFile,
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
    scripts: [
      { script: getScriptPath("hello.js") },
      { script: getScriptPath("silent.js") },
    ],
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

    case "status":
    case "html":
    case "log":
    case "error":
    case "stream":
    case "gotoUrl":
    case "pushUrlState":
    case "replaceUrlState":
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
      script: filterAbsoluteFilepath(status.script),
    };

    if ("id" in newStatus) {
      newStatus.id = "filtered";
    }

    return newStatus;
  });
