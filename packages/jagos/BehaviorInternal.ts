import { WsPoolProv } from "^jab-express";

import {
  ClientMessage,
  ServerMessage,
  ScriptPoolProv,
  ClientComProv,
} from "./internal";

// prov

export type BehaviorInternalProv = {
  onStartListen: () => void;
};

// deps

export type BehaviorInternalDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  scriptPool: ScriptPoolProv;
  onError: (error: unknown) => void;
} & Pick<ClientComProv, "sendProcessStatus">;

/**
 *
 */
export class BehaviorInternal implements BehaviorInternalProv {
  constructor(private deps: BehaviorInternalDeps) {}

  /**
   *
   */
  public onStartListen = () => {
    this.deps.scriptPool.updateScripts();
    this.deps.sendProcessStatus(this.deps.scriptPool.getScriptStatus());
  };
}
