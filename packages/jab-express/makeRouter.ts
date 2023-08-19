import cors from "cors";
import express from "express";

import { WebsocketRequestHandler, expressErrorsThrow } from "./internal";

export type RouteDef = {
  onWsUpgrade: WebsocketRequestHandler;
};

/**
 * Fairly general way to make a web socket route.
 *
 * note: Explicit return type is fix for: https://github.com/microsoft/TypeScript/issues/47663
 */
export const makeGeneralRouter = (def: RouteDef): express.Router => {
  const router = express.Router();

  // middleware

  router.use(cors()); // allow all cors

  // router definitions

  const { onWsUpgrade } = def;

  // web socket

  onWsUpgrade && (router as any).ws("/ws", onWsUpgrade as any);

  // error handler

  router.use("*", expressErrorsThrow);

  return router;
};
