import WebSocket from "ws";

import { WsServerService } from "^jab-express";

import { makeOnRequest } from "./onRequest";

import { Behavior } from "./Behavior";
import { ActionProvider } from "./ActionProvider";
import { makeOnClientMesssage } from "./onClientMesssage";

export type Deps = Readonly<{
  wsServer: WebSocket.Server;
}>;

/**
 *
 */
export const director = (deps: Deps) => {
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
    onShutdown: behaviorProv.onShutdown,
  };
};
//
