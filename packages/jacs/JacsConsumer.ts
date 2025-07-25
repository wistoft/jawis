import { parentPort } from "node:worker_threads";

import { nodeRequire } from "^jab-node";
import { registerPrecompilers } from "^node-module-hooks-plus";
import { Waiter } from "^state-waiter";
import { WaitFunc } from "^jab";

import { ConsumerMessage, WorkerData, requestProducerSync } from "./internal";

export type JacsConsumerDeps = {
  shared: Pick<
    WorkerData,
    "controlArray" | "dataArray" | "timeout" | "softTimeout" | "channelToken"
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

  private compiledCode = new Map<string, string>();

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
   * So we can give generated code to source-map-support
   *
   *  - we could also keep a set of compiled files instead, and the just get the code with `this.compile`
   *      That would save memory.
   */
  public getCachedCode = (file: string) => this.compiledCode.get(file);

  /**
   *
   */
  public compile = (file: string): string => {
    const res = requestProducerSync(
      file,
      this.deps.shared.controlArray,
      this.deps.shared.dataArray,
      this.deps.shared.timeout,
      this.deps.shared.softTimeout,
      this.deps.shared.channelToken,
      this.deps.postMessage || ((msg) => parentPort!.postMessage(msg)),
      this.deps.wait,
      Date.now
    );

    this.compiledCode.set(file, res);

    return res;
  };
}
