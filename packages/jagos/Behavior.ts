import WebSocket from "ws";

import { WsPoolProv } from "^jab-express";

import { ClientMessage, ServerMessage } from "^jagoc";

import { ScriptPoolProv } from "./ScriptPoolController";
import { ActionProv } from "./ActionProvider";
import { safeAll } from "^jab";

// prov

export type BehaviorProv = {
  onStartListen: (ws: WebSocket) => void;
};

// deps

export type BehaviorDeps = ActionProv & {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  scriptPool: ScriptPoolProv;

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
  public onStartListen = () => {
    this.deps.sendProcessStatus();
  };

  /**
   *
   */
  public onShutdown = () =>
    safeAll(
      [this.deps.scriptPool.shutdown(), this.deps.wsPool.shutdown()],
      this.deps.onError
    ).then(() => {}); //just for typing
}
