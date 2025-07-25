import cors from "cors";
import express, { RequestHandler } from "express";
import bodyParser from "body-parser";
import { WebsocketRequestHandler } from "express-ws";

import { expressErrorsThrow } from "./internal";

export type RouteDef = {
  onGet?: RequestHandler;
  requestHandler?: RequestHandler; //rename onPost
  onWsUpgrade?: WebsocketRequestHandler;
};

/**
 * Fairly general way to set express route up.
 *
 * note: Explicit return type is fix for: https://github.com/microsoft/TypeScript/issues/47663
 */
export const makeMakeGeneralRouter = (def: RouteDef) => (): express.Router => {
  const router = express.Router();

  // middleware

  router.use(cors()); // allow all cors

  router.use(bodyParser.json());

  // router definitions

  const { onGet, requestHandler, onWsUpgrade } = def;

  // http GET

  onGet && router.get("*", onGet);

  // http POST

  requestHandler && router.post("/", requestHandler);

  // web socket

  onWsUpgrade && (router as any).ws("/ws", onWsUpgrade as any);

  // catch missing routes

  router.use("*", (req) => {
    throw new Error("Unknown route: " + req.originalUrl);
  });

  // error handler

  router.use("*", expressErrorsThrow);

  return router;
};
