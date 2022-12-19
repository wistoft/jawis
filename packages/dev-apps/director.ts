import WebSocket from "ws";

import { WsServerService } from "^jab-express";

import { makeOnRequest } from "./onRequest";

import { Behavior } from "./Behavior";
import { ActionProvider } from "./ActionProvider";
import { makeOnClientMesssage } from "./onClientMesssage";
import { FinallyFunc } from "^finally-provider";

export type Deps = Readonly<{
  wsServer: WebSocket.Server;
  finally: FinallyFunc;
}>;

/**
 *
 */
export const director = (deps: Deps) => {
  deps.finally(() => behaviorProv.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsService = new WsServerService(deps);

  const actionProv = new ActionProvider({ wsService });

  const behaviorProv = new Behavior({
    wsService,
    ...actionProv,
  });

  const onWsMessage = makeOnClientMesssage({
    ...actionProv,
    ...behaviorProv,
  });

  const requestHandler = makeOnRequest({
    ...actionProv,
    ...behaviorProv,
  });

  return {
    onWsMessage,
    requestHandler,
  };
};
