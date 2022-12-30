import type WebSocket from "ws";
import type express from "express";
import type expressWs from "express-ws";

import type { MainProv } from "^jab-node";

import type { NodeWS, SocketData } from ".";

export type ServerAppRouter = {
  router: express.Router;
  onShutdown?: () => Promise<void>;
};

//
// div
//

export type MakeServerApp = (deps: MainProv) => express.Application;

export type MakeServerAppRouter = (
  deps: MainProv & { makeRouter: () => WsRouter; wsServer: WebSocket.Server }
) => ServerAppRouter;

//
// ws
//

export type WsMessageListenerOld = (
  this: WebSocket,
  data: WebSocket.Data
) => void;

export type WsMessageListener<MS extends SocketData, MR extends SocketData> = (
  message: MR,
  nws: NodeWS<MS, MR>
) => void;

export type WsRouter = expressWs.Router & {
  wsMessage: <MS extends SocketData, MR extends SocketData>(
    route: string | RegExp | Array<string | RegExp>,
    ...middlewares: Array<WsMessageListener<MS, MR>>
  ) => unknown;
};
