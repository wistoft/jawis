import path from "node:path";

import { NodeWS, WsPoolProv } from "^jab-express";
import { safeAll, then } from "^yapu";
import { err, unknownToErrorData } from "^jab";

import { CallMessage, ClientMessage, ServerMessage } from "./internal";

// prov

export type BehaviorProv = {
  callFunction: (
    msg: CallMessage,
    nws: NodeWS<ServerMessage, ClientMessage>
  ) => void;
};

// deps

export type BehaviorDeps = {
  projectRoot: string;
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  onError: (error: unknown) => void;
};

/**
 *
 */
export class Behavior implements BehaviorProv {
  constructor(private deps: BehaviorDeps) {}

  /**
   *
   */
  public callFunction = (
    msg: CallMessage,
    nws: NodeWS<ServerMessage, ClientMessage>
  ) => {
    then(() => {
      const args = JSON.parse(msg.args);

      const absPath = path.join(this.deps.projectRoot, msg.path);

      const mod = require(absPath);

      const func = mod[msg.func];

      if (typeof func !== "function") {
        err("Could not call: " + msg.func, { available: Object.keys(mod) });
      }

      return then(() => func(...args)).catch((error: unknown) => {
        nws.send({
          type: "function-exception",
          id: msg.id,
          func: msg.func,
          error: unknownToErrorData(error),
        });
      });
    })
      .then((value) => {
        nws.send({
          type: "function-response",
          id: msg.id,
          value: value,
        });
      })
      .catch(this.deps.onError);
  };

  /**
   *
   */
  public onShutdown = () =>
    safeAll([this.deps.wsPool.shutdown()], this.deps.onError).then(() => {}); //just for typing
}
