import { nodeRequire, registerPrecompilers } from "^jab-node";

import { parentPort } from "worker_threads";

import { Waiter } from "^jab";

import { requestProducerSync, WaitFunc } from "./protocol";
import type { ConsumerMessage, WorkerData } from ".";

export type JacsConsumerDeps = {
  shared: Pick<
    WorkerData,
    "controlArray" | "dataArray" | "timeout" | "softTimeout"
  >;
  onError: (error: unknown) => void;

  //for development

  wait?: WaitFunc;
  postMessage?: (msg: ConsumerMessage) => void;
};

type States = "ready" | "compiling" | "error";
type Events = never;

/**
 *
 */
export class JacsConsumer {
  private registered = false;

  public waiter: Waiter<States, Events>;

  constructor(private deps: JacsConsumerDeps) {
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "ready",
    });
  }

  /**
   *
   */
  public register = () => {
    if (this.registered) {
      throw new Error("Already registered.");
    }

    registerPrecompilers([".ts", ".tsx"], this.compile);

    this.registered = true;
  };

  /**
   *
   */
  public unregister = () => {
    if (!this.registered) {
      throw new Error("Can't unregister. JacsConsumer not registered.");
    }

    //this should work, because it's checked, that nothing is registered, when jacs is registered.

    delete nodeRequire.extensions[".ts"];
    delete nodeRequire.extensions[".tsx"];
  };

  /**
   *
   */
  public compile = (file: string): string =>
    requestProducerSync(
      file,
      this.deps.shared.controlArray,
      this.deps.shared.dataArray,
      this.deps.shared.timeout,
      this.deps.shared.softTimeout,
      this.deps.postMessage || ((msg) => parentPort!.postMessage(msg)),
      this.deps.wait,
      Date.now
    );
}
