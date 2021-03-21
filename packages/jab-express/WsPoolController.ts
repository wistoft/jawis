import { WebsocketRequestHandler } from "express-ws";
import WebSocket from "ws";

import { safeAll } from "^jab";
import { NodeWS, SocketData } from "^jab-node";

import {
  makeUpgradeHandler,
  MakeUpgradeHandlerDeps,
  WsMessageListener,
} from ".";

export type WsPoolProv<
  MS extends SocketData,
  MR extends SocketData
> = Readonly<{
  send: (data: MS) => void;
  forAll: (cb: (nws: NodeWS<MS, MR>) => void) => void;
  shutdown: () => Promise<void>;
}>;

type Deps = Readonly<MakeUpgradeHandlerDeps>;

/**
 * Manage the WebSocket connection for a single express route.
 *
 * - This allows sending messages to only those connected to this specific route.
 */
export class WsPoolController<MS extends SocketData, MR extends SocketData>
  implements WsPoolProv<MS, MR> {
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
    onMessage: WsMessageListener<MS, MR>
  ): WebsocketRequestHandler => {
    const onOpen = (nws: NodeWS<MS, MR>) => {
      this.clients.add(nws);

      nws.ws.on("close", () => {
        this.clients.delete(nws);
      });
    };

    return makeUpgradeHandler(this.deps, onMessage, onOpen);
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
