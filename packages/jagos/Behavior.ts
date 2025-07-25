import { WsPoolProv } from "^jab-express";
import { safeAll } from "^yapu";

import {
  ClientMessage,
  ServerMessage,
  ScriptPoolProv,
  ClientComProv,
} from "./internal";

// prov

export type BehaviorProv = {
  onStartListen: () => void;
};

// deps

export type BehaviorDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  scriptPool: ScriptPoolProv;
  onError: (error: unknown) => void;
} & Pick<ClientComProv, "sendProcessStatus">;

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
