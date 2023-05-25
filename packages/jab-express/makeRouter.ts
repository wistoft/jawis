import cors from "cors";
import express from "express";
import { WebsocketRequestHandler } from "express-ws";

import { expressErrorsThrow } from "./internal";

export type RouteDef = {
  onWsUpgrade: WebsocketRequestHandler;
};

/**
 * Fairly general way to make a web socket route.
 */
export const makeGeneralRouter = (def: RouteDef) => {
  const router = express.Router();

  // middleware

  router.use(cors()); // allow all cors

  // router definitions

  const { onWsUpgrade } = def;

  // web socket

  onWsUpgrade && router.ws("/ws", onWsUpgrade);

  // error handler

  router.use("*", expressErrorsThrow);

  return router;
};
