import { assertNever } from "^jab";
import { WsMessageListener } from "^jab-express";

import {
  ClientMessage,
  ServerMessage,
  ClientComProv,
  BehaviorProv,
} from "./internal";

type Deps = ClientComProv & BehaviorProv;

/**
 *
 */
export const makeOnClientMessage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  (msg, nws) => {
    switch (msg.type) {
      case "ping":
        nws.send({ type: "pong" });
        break;

      case "pingClients":
        deps.onPingAll();
        break;

      case "stopServer":
        console.log("Stopping server.");
        process.exit();

      // eslint-disable-next-line no-fallthrough
      case "poisonReceiveEmptyObject":
        nws.send({} as any);
        break;

      default:
        assertNever(msg, "Unknown client message type.");
    }
  };
