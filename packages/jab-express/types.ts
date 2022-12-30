import express from "express";

import { NodeWS, SocketData } from "./internal";

export type ServerAppRouter = {
  router: express.Router;
  onShutdown?: () => Promise<void>;
};

//
// ws
//

export type WsMessageListener<MS extends SocketData, MR extends SocketData> = (
  message: MR,
  nws: NodeWS<MS, MR>
) => void;
