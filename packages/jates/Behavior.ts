import { WsPoolProv } from "^jab-express";
import { ClientMessage, ServerMessage } from "^jatec";
import { safeAll, safeAllWait } from "^yapu";
import { TestFrameworkProv } from "./internal";

// prov

export type BehaviorProv = {};

// deps

export type BehaviorDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  testFramework: TestFrameworkProv;
  onError: (error: unknown) => void;
};

/**
 *
 */
export class Behavior implements BehaviorProv {
  private currentWork: Set<Promise<unknown>> = new Set();

  constructor(private deps: BehaviorDeps) {}

  /**
   *
   */
  public setWorking = (prom: Promise<unknown>) => {
    this.currentWork.add(prom);

    prom.finally(() => {
      this.currentWork.delete(prom);
    });
  };

  /**
   *
   */
  public onShutdown = async () => {
    //first kill framework to stop its work

    await this.deps.testFramework.kill();

    //wait for promises started by director

    await safeAllWait(Array.from(this.currentWork), this.deps.onError);

    //shutdown client connections

    await this.deps.wsPool.shutdown();
  };
}
