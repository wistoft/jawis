import bodyParser from "body-parser";
import WebSocket from "ws";
import cors from "cors";

import {
  expressErrorsThrow,
  makeMakeRouter,
  MakeUpgradeHandlerDeps,
  ServerAppRouter,
  WsRouter,
} from "^jab-express";

import { director } from "./director";
import { LogProv } from "^jab";
import { FinallyFunc } from "^finally-provider";

export type Deps = {
  wsServer: WebSocket.Server;
  onError: (error: unknown) => void;
  logProv: LogProv;
  finally: FinallyFunc;
};

/**
 *
 */
export const makeDefaultRoute = (deps: Deps): ServerAppRouter => {
  const makeRouter = makeMakeRouter(deps);
  const router = makeRouter();

  // middleware

  router.use(cors()); // allow all cors

  router.use(bodyParser.json());

  // create app structure

  const { requestHandler, onWsMessage } = director({
    wsServer: deps.wsServer,
    finally: deps.finally,
  });

  // http

  router.post("/", requestHandler);

  // web socket

  router.wsMessage("/ws", onWsMessage);

  // catch missing routes

  router.use("*", (req) => {
    throw new Error("DefaultApi: Unknown route: " + req.originalUrl);
  });

  // error handler

  router.use("*", expressErrorsThrow);

  return {
    router,
  };
};
