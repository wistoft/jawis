import { WsPoolProv } from "^jab-express";

import { ClientMessage, ServerMessage } from "^jagoc";

import { ScriptPoolProv } from "./ScriptPoolController";
import { ActionProv } from "./ActionProvider";
import { safeAll } from "^jab";

// prov

export type BehaviorProv = {
  onStartListen: () => void;
};

// deps

export type BehaviorDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  scriptPool: ScriptPoolProv;
  onError: (error: unknown) => void;
} & Pick<ActionProv, "sendProcessStatus">;

/**
 *
 */
export class Behavior implements BehaviorProv {
  constructor(private deps: BehaviorDeps) {}

  /**
   *
   */
  public onStartListen = () => {
    this.deps.scriptPool.updateScripts();
    this.deps.sendProcessStatus(this.deps.scriptPool.getScriptStatus());
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
