import cors from "cors";
import express, { RequestHandler } from "express";
import bodyParser from "body-parser";
import { WebsocketRequestHandler } from "express-ws";

import { expressErrorsThrow, ServerAppRouter } from "^jab-express";

export type RouteDef = {
  onGet?: RequestHandler;
  requestHandler?: RequestHandler; //rename onPost
  onWsUpgrade?: WebsocketRequestHandler;
  onShutdown?: () => Promise<void>;
};

/**
 * Fairly general way to set express route up.
 */
export const makeRoute = (def: RouteDef): ServerAppRouter => {
  const router = express.Router();

  // middleware

  router.use(cors()); // allow all cors

  router.use(bodyParser.json());

  // create app structure

  const { onGet, requestHandler, onWsUpgrade, onShutdown } = def;

  // http GET

  onGet && router.get("*", onGet);

  // http POST

  requestHandler && router.post("/", requestHandler);

  // web socket

  onWsUpgrade && router.ws("/ws", onWsUpgrade);

  // error handler

  router.use("*", expressErrorsThrow);

  return {
    router,
    onShutdown,
  };
};
