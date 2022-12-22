import { Serializable } from "child_process";

import { def } from "^jab";

import { Waiter } from "^state-waiter";
import { Bee, BeeListeners } from "..";
import { WatchableProcessPreloaderDeps, WatchableProcessPreloader } from ".";

type States = "ready" | "using" | "stopping" | "done";

/**
 * Reusable, watchable process proloader
 *
 * - Doesn't preload at 'load. Has to use one time, before preloading starts.
 * - It's reusable serially, only.
 * - Shutdown can't be performed in `using` state.
 * - Kill can be performed in any state. Also in `using` state.
 *      And it's guarantees nothing else need to be killed. The promise will reject.
 *
 * todo
 *  when cancelled, this remains in using-state, and becomes unusable.
 */
export class ReusableWPP<MR extends Serializable, MS extends Serializable> {
  private wpp?: WatchableProcessPreloader<MR, MS>;
  private waiter: Waiter<States, never>;

  /**
   *
   */
  constructor(private deps: WatchableProcessPreloaderDeps) {
    this.deps.finally(() => this.noisyKill()); //must be before the process preloader, because we want to shutdown, before it.

    this.waiter = new Waiter<States, never>({
      onError: this.deps.onError,
      startState: "ready",
      stoppingState: "stopping",
      endState: "done",
    });
  }

  /**
   *
   */
  public useProcess = (listeners: BeeListeners<MR>) => {
    if (!this.waiter.is("ready")) {
      return Promise.reject(
        new Error("ReusableWPP is not ready (" + this.waiter.getState() + ").")
      );
    }

    if (!this.wpp) {
      this.wpp = new WatchableProcessPreloader(this.deps);
    }

    this.waiter.set("using");

    return this.wpp.useProcess(listeners).then((proc) => {
      this.wpp = new WatchableProcessPreloader(this.deps);

      this.waiter.set("ready");

      return proc as Bee<MS>;
    });
  };

  /**
   *
   *
   */
  public cancel = (msg?: string) => def(this.wpp).cancel(msg);

  public shutdown = () => {
    if (this.waiter.is("using")) {
      return Promise.reject(
        new Error("Can't shutdown, when use is in progress")
      );
    }

    return this.waiter.shutdown(() => this.wpp?.shutdown(), true);
  };

  public kill = () => this.waiter.kill(() => this.wpp?.kill(), true);

  public noisyKill = () =>
    this.waiter.noisyKill(() => this.wpp?.kill(), "ReusableWPP", true);
}
