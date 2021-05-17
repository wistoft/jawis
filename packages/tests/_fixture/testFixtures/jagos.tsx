import { TestProvision } from "^jarun";
import { ClientMessage, ServerMessage } from "^jagoc";

import { getLogProv, getScriptPath, makeJacsWorker, WsPoolMock } from ".";
import { director, Deps as DirectorDeps } from "^jagos/director";
import { NodeWS } from "^jab-node";

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
    wsPool: new WsPoolMock(prov),
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
