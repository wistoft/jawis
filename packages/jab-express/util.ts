import { NextFunction, Request, Response } from "express";
import { WebsocketRequestHandler } from "express-ws";

import { FinallyFunc } from "^finally-provider";
import { LogProv } from "^jab";

import { NodeWS, SocketData, WsMessageListener } from "./internal";

export type MakeUpgradeHandlerDeps = {
  onError: (error: unknown) => void;
  logProv: LogProv;
  finally: FinallyFunc;
};

/**
 * Wrap the WebSocket object in NodeWs, to get:
 *
 * - Typed send funtion.
 * - Strict management of ws state.
 */
export const makeUpgradeHandler =
  <MS extends SocketData, MR extends SocketData>(
    deps: MakeUpgradeHandlerDeps,
    onMessage: WsMessageListener<MS, MR>,
    onOpen = (_nws: NodeWS<MS, MR>) => {},
    onClose = () => {}
  ): WebsocketRequestHandler =>
  (ws) => {
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
 *
 * - Always output error on server.
 * - Try to send the error to browser.
 *
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
  //show message on server

  setTimeout(() => {
    //todo: wouldn't it be better to take onError?
    throw err;
  }, 0);

  // can't send anything to browser, when it's a web socket upgrade request

  if (req.headers.upgrade) {
    return;
  }

  //message to the browser

  if (res.headersSent) {
    //we can't sent to client reliably here.
    //must we end the connection, so the client don't hangs.
    res.end();
  } else {
    if (req.method === "GET") {
      res.type("txt");
      res.send(err.stack);
    } else {
      res.json({
        status: "err",
        message: err.message,
        strack: err.stack,
      });
    }
  }
};
