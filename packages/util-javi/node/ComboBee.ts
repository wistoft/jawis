import { BeeStates, JabShutdownMessage, then, Waiter } from "^jab";

import type { Bee, BeeDeps } from "^jab";

type States = "running" | "stopping" | "stopped";
type Events = "message";

/**
 * unfinished
 *
 * Exposes a bee interface for bees executed in serial.
 *
 * - A new bee must not be started, when `terminated===true`
 *
 * todo: does this need a waiter?
 */
export class ComboBee<MS extends {}, MR extends {}> implements Bee<MS> {
  public waiter: Waiter<States, Events>;

  public currentBee?: Bee<MS>;
  public terminated = false; //indicates, whether we should continue starting sub bees.

  /**
   *
   */
  constructor(public deps: BeeDeps<MR>) {
    this.waiter = new Waiter<States, Events>({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    this.deps.finally(() => this.noisyKill());
  }

  /**
   * Set the current bee for this combo bee.
   *
   * todo: unset the current bee again, when it stops.
   */
  public setCurrent = (bee?: Bee<MS>) => {
    if (this.terminated === true) {
      throw new Error("The bee has been terminated.");
    }

    this.currentBee = bee;
  };

  /**
   *
   */
  public send = (_data: JabShutdownMessage | MS) => {
    throw new Error("not impl");
  };

  /**
   *
   */
  private realShutdown = () => {
    this.terminated = true;

    if (this.currentBee) {
      return this.currentBee.shutdown();
    } else {
      return then(() => {
        this.deps.onExit(0);
      });
    }
  };

  /**
   *
   */
  private realKill = () => {
    this.terminated = true;

    if (this.currentBee) {
      return this.currentBee.kill();
    } else {
      return then(() => {
        this.deps.onExit(0);
      });
    }
  };

  /**
   *
   */
  public shutdown = () => this.waiter.shutdown(this.realShutdown, true);

  public noisyKill = () =>
    this.waiter.noisyKill(this.realKill, "ComboBee", true);

  public kill = () => this.waiter.kill(this.realKill, true);

  public is = (state: BeeStates) => this.waiter.is(state);
}
