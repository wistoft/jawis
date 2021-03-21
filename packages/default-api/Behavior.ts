import { WsServerProv } from "^jab-express";

import { ServerMessage } from "^default-common";

import { ActionProv } from "./ActionProvider";

export type BehaviorProv = {
  doSomething: () => void;
};

export type BehaviorDeps = ActionProv & {
  wsService: WsServerProv<ServerMessage>;
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
    Promise.resolve().then(() => {
      // one could wait for clients to close.
      this.deps.wsService.forAll((client) => {
        client.close(4000);
      });
    });
}
