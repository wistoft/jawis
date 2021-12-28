import { assertNever, BeeDeps, HoneyComb } from "^jab";
import { TestProvision } from "^jarun";
import { ClientMessage, ScriptStatus, ServerMessage } from "^jagoc";
import { director, Deps as DirectorDeps } from "^jagos/director";
import { NodeWS } from "^jab-express";

import {
  filterFilepath,
  getLogProv,
  getMakeJacsWorker,
  getScriptPath,
  WsPoolMock,
} from ".";

import { makePlainWorkerBee } from "^jab-node";
import { WsBuzzStore } from "^jabroc";
import { FileService } from "^util-javi/node";

export const getTestHoneyComb = (): HoneyComb => ({
  isBee: (filename: string) => filename.endsWith(".br.js"),
  makeBee: makePlainWorkerBee,
  makeCertainBee: <MR extends {}>(_type: "ww", _deps: BeeDeps<MR>) => {
    throw new Error("not impl");
  },
});

const testBrowserBeeFrost: WsBuzzStore = {
  register: () => {
    // noop
  },
  onMessage: () => {
    throw new Error("not impl");
  },
  tryGetOne: () => {
    throw new Error("not impl");
  },
};

/**
 *
 */
export const getJagosDirector = (
  prov: TestProvision,
  extraDeps?: Partial<DirectorDeps>
) => {
  const fileService: FileService = {
    handleOpenFileInEditor: () => {},
    compareFiles: () => {},
  };

  const d = director({
    projectRoot: "projectRoot",
    alwaysTypeScript: true, //development needs typescript for the preloader.
    makeTsBee: getMakeJacsWorker(),
    honeyComb: getTestHoneyComb(),
    browserBeeFrost: testBrowserBeeFrost,
    onError: prov.onError,
    finally: prov.finally,
    logProv: getLogProv(prov),
    wsPool: new WsPoolMock<ServerMessage, ClientMessage>({
      log: prov.log,
      filterMessage: filterJagosMessage,
    }),
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
        script: filterFilepath(msg.script),
      };

    case "control":
    case "message":
    case "log":
      return msg;

    case "beeFrost":
      throw new Error("not impl");
      break;

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
      script: filterFilepath(status.script),
    };

    if ("id" in newStatus) {
      newStatus.id = "filtered";
    }

    return newStatus;
  });
