import { WsPoolProv } from "^jab-express";
import { ClientMessage, ServerMessage } from "^jatec";
import { safeAll } from "^jab";
import { TestFrameworkProv } from ".";

// prov

export type BehaviorProv = {};

// deps

export type BehaviorDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  tf: TestFrameworkProv;
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
  public onShutdown = () =>
    safeAll(
      [this.deps.tf.kill(), this.deps.wsPool.shutdown()],
      this.deps.onError
    ).then(() => {}); //just for typing
}
