import express from "express";
import * as ws from "ws";

import { NodeWS, SocketData } from "./internal";

//tobe-deprecated
export type ServerAppRouter = {
  router: express.Router;
  onShutdown?: () => Promise<void>;
};

export type WsMessageListener<MS extends SocketData, MR extends SocketData> = (
  message: MR,
  nws: NodeWS<MS, MR>
) => void;

//Taken from @types/express-ws
export type WebsocketRequestHandler = (ws: ws, _req: any, _next: any) => void;

//quick fix
export { express };
