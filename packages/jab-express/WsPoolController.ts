import { WebsocketRequestHandler } from "express-ws";
import WebSocket from "ws";

import { FinallyFunc } from "^finally-provider";
import { LogProv } from "^jab";
import { safeAll } from "^yapu";

import {
  NodeWS,
  SocketData,
  makeUpgradeHandler,
  WsMessageListener,
} from "./internal";

export type WsPoolProv<
  MS extends SocketData,
  MR extends SocketData,
> = Readonly<{
  send: (data: MS) => void;
  forAll: (cb: (nws: NodeWS<MS, MR>) => void) => void;
  makeUpgradeHandler: (
    onMessage: WsMessageListener<MS, MR>,
    onOpen?: (nws: NodeWS<MS, MR>) => void
  ) => WebsocketRequestHandler;
  shutdown: () => Promise<void>;
}>;

type Deps = {
  onError: (error: unknown) => void;
  logProv: LogProv;
  finally: FinallyFunc;
};

/**
 * Manage the WebSocket connection for a single express route.
 *
 * - This allows sending messages to only those connected to this specific route.
 */
export class WsPoolController<MS extends SocketData, MR extends SocketData>
  implements WsPoolProv<MS, MR>
{
  public clients = new Set<NodeWS<MS, MR>>();

  constructor(private deps: Deps) {}

  /**
   *
   */
  public send = (data: MS) => {
    this.forAll((client) => {
      client.send(data);
    });
  };

  /**
   *
   */
  public forAll = (cb: (client: NodeWS<MS, MR>) => void) => {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        cb(client);
      }
    });
  };

  /**
   *
   */
  public makeUpgradeHandler = (
    onMessage: WsMessageListener<MS, MR>,
    onOpen?: (nws: NodeWS<MS, MR>) => void
  ) => {
    const onOpenReal = (nws: NodeWS<MS, MR>) => {
      this.clients.add(nws);

      nws.ws.on("close", () => {
        this.clients.delete(nws);
      });

      //call the user's onOpen

      onOpen && onOpen(nws);
    };

    return makeUpgradeHandler(this.deps, onMessage, onOpenReal);
  };

  /**
   *
   */
  public shutdown = () =>
    safeAll(
      Array.from(this.clients).map((nws) => nws.shutdown()),
      this.deps.onError
    ).then(() => {}); //just for typing
}
