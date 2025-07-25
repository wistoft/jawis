import {
  Bee,
  BeeEvents,
  BeeStates,
  BeeShutdownMessage,
  BeeDeps,
} from "^bee-common";
import { Waiter } from "^state-waiter";

import { BeeFrostServerMessage } from "./internal";

type Deps<MR extends {}> = {
  bid: number;
  beeDeps: BeeDeps<MR>;
  send: (msg: BeeFrostServerMessage) => void;
};

/**
 * Represents a remote bee.
 *
 *  - Reflects the bee state locally, so it can be queried.
 *  - Send shutdown/kill as messages, so the hive can perform them.
 *  - Adds meta data to outgoing messages, so the hive knows which bee is the receiver.
 *
 */
export class BeeShell<MR extends {}, MS extends {}> implements Bee<MS> {
  public waiter: Waiter<BeeStates, BeeEvents>;

  /**
   *
   */
  constructor(public deps: Deps<MR>) {
    //must be first, because listeners depend on it.

    this.waiter = new Waiter({
      onError: deps.beeDeps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //ensure clean shutdown

    this.deps.beeDeps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  public onExit = () => {
    this.waiter.set("stopped");

    this.deps.beeDeps.onExit();
  };

  /**
   *
   * todo:
   *  check we are running
   */
  public send = (msg: BeeShutdownMessage | MS) =>
    this.deps.send({
      type: "message",
      bid: this.deps.bid,
      data: msg,
    });

  /**
   *
   */
  public shutdown = () =>
    this.waiter.shutdown(() =>
      this.deps.send({
        type: "shutdown",
        bid: this.deps.bid,
      })
    );

  public noisyKill = () => this.waiter.noisyKill(this.realKill, "BeeShell");

  public kill = () => this.waiter.kill(this.realKill);

  public is = (state: BeeStates) => this.waiter.is(state);

  private realKill = () =>
    this.deps.send({
      type: "kill",
      bid: this.deps.bid,
    });
}
