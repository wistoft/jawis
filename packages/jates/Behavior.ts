import { WsPoolProv } from "^jab-express";
import { safeAllWait } from "^yapu";

import {
  ClientMessage,
  ServerMessage,
  ComposedTestFrameworkProv,
  ClientComProv,
} from "./internal";

// prov

export type BehaviorProv = {
  onGetAllTests: () => void;
};

// deps

export type BehaviorDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  testFramework: ComposedTestFrameworkProv;
  onError: (error: unknown) => void;
} & Pick<ClientComProv, "onTestSelectionReady">;

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
  public onGetAllTests = () => {
    this.deps.testFramework.getTestInfo().then((ids) => {
      this.deps.wsPool.send({
        type: "TestSelection",
        data: [ids],
      });
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
