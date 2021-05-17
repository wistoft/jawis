import express, { NextFunction, Request, Response } from "express";
import { PathParams } from "express-serve-static-core";
import { WebsocketRequestHandler } from "express-ws";
import { LogProv, FinallyFunc } from "^jab";

import { NodeWS, SocketData , WsMessageListener, WsRouter } from ".";


export type MakeUpgradeHandlerDeps = {
  onError: (error: unknown) => void;
  logProv: LogProv;
  finally: FinallyFunc;
};

/**
 * todo: delete this.
 */
export const makeMakeRouter = (
  deps: MakeUpgradeHandlerDeps
) => (): WsRouter => {
  const router = express.Router() as WsRouter;

  router.wsMessage = <MS extends SocketData, MR extends SocketData>(
    route: PathParams,
    onMessage: WsMessageListener<MS, MR>
  ) => {
    router.ws(route, makeUpgradeHandler(deps, onMessage));
  };

  return router;
};

/**
 * Wrap the WebSocket object in NodeWs, to get:
 *
 * - Typed send funtion.
 * - Strict management of ws state.
 */
export const makeUpgradeHandler = <
  MS extends SocketData,
  MR extends SocketData
>(
  deps: MakeUpgradeHandlerDeps,
  onMessage: WsMessageListener<MS, MR>,
  onOpen = (_nws: NodeWS<MS, MR>) => {},
  onClose = () => {}
): WebsocketRequestHandler => (ws, _req, _next) => {
  const nws = new NodeWS<MS, MR>({
    ...deps,
    ws,
    startState: "running",

    onMessage: (data) => {
      onMessage(data, nws);
    },

    onOpen: () => {
      deps.logProv.log("makeUpgradeHandler() - expected socket to be open.");
    },

    onClose,
  });

  onOpen(nws);
};

/**
 * hacky
 *  - when and where to call end()
 *  - can't send error object in end() in node 14.
 */
export const expressErrorsThrow = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  //wouldn't it be better to take onError?
  setTimeout(() => {
    throw err;
  }, 0);

  //message to developer via GUI

  if (req.headers.upgrade) {
    // quick fix for error in web socket handler.
    console.log("WSError: ");
    console.log(err);
  } else {
    if (res.headersSent) {
      //we can't sent to client reliably here.
      //must we can end the connection, so the client don't hangs.
      res.end();
    } else {
      res.json({
        status: "err",
        message: err.message,
      });
    }
  }

  res.end(err);
};
