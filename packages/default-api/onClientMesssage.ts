import { assertNever } from "^jab";
import { ClientMessage, ServerMessage } from "^default-common";
import { WsMessageListener } from "^jab-express";

import { BehaviorProv } from "./Behavior";
import { ActionProv } from "./ActionProvider";

export type Deps = ActionProv & BehaviorProv;

/**
 *
 */
export const makeOnClientMesssage = (
  deps: Deps
): WsMessageListener<ServerMessage, ClientMessage> => (msg, nws) => {
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

    case "poisonReceiveEmptyObject":
      nws.send({} as any);
      break;

    default:
      throw assertNever(msg, "Unknown client message type.");
  }
};
