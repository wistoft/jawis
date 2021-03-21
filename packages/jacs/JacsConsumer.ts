import { parentPort } from "worker_threads";

import { registerPrecompiler } from "^jab-node";
import { Waiter } from "^jab";

import { requestProducerSync, WaitFunc } from "./protocol";
import type { ConsumerMessage, WorkerData } from ".";

export type JacsConsumerDeps = {
  shared: Pick<WorkerData, "controlArray" | "dataArray" | "timeout">;
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

    registerPrecompiler([".ts", ".tsx"], this.compile);

    this.registered = true;
  };

  /**
   *
   */
  public unregister = () => {
    if (!this.registered) {
      throw new Error("Not registered.");
    }

    throw new Error("Not impl.");
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
      this.deps.postMessage || ((msg) => parentPort!.postMessage(msg)),
      this.deps.wait
    );
}
