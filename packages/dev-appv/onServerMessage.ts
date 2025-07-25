import { assertNever } from "^jab";

import { ServerMessage } from "./internal";

type Deps = {};

/**
 *
 */
export const makeOnServerMessage = (_deps: Deps) => (msg: ServerMessage) => {
  switch (msg.type) {
    case "pong":
      console.log("pong");
      break;

    case "ping all":
      console.log("ping all");
      break;

    default:
      assertNever(msg, "Unknown server message.");
  }
};
