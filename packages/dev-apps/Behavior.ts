import { WsPoolProv } from "^jab-express";
import { safeAll } from "^yapu";

import { ClientMessage, ServerMessage } from "./internal";

// prov

export type BehaviorProv = {
  doSomething: () => void;
};

// deps

export type BehaviorDeps = {
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
  public doSomething = () => {
    console.log("doSomething");
  };

  /**
   *
   */
  public onShutdown = () =>
    safeAll([this.deps.wsPool.shutdown()], this.deps.onError).then(() => {}); //just for typing
}
