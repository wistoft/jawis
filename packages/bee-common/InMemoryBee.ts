import { then } from "^yapu";
import { Waiter } from "^state-waiter";

import { Bee, BeeDeps, BeeStates, BeeShutdownMessage } from "./internal";

type States = "running" | "stopping" | "stopped";
type Events = "message";

type Beehavior<MS extends {}, MR extends {}> = {
  requireGracefulShutdown?: boolean;
  onInit?: (bee: InMemoryBee<MS, MR>) => void;
  onSend?: (data: BeeShutdownMessage | MS, bee: InMemoryBee<MS, MR>) => void;
};

/**
 *
 */
export class InMemoryBee<MS extends {}, MR extends {}> implements Bee<MS> {
  public waiter: Waiter<States, Events>;

  private isGraceful = false;
  private terminated = false;

  /**
   *
   */
  constructor(
    public deps: BeeDeps<MR>,
    private beehavior: Beehavior<MS, MR>
  ) {
    this.waiter = new Waiter<States, Events>({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    this.deps.finally(() => this.noisyKill());

    //async, because caller will not be ready here.

    then(() => this.beehavior.onInit && this.beehavior.onInit(this));
  }

  /**
   * async, because caller will not be ready to handle sync, when it sends.
   *
   */
  public send = (data: BeeShutdownMessage | MS) => {
    if (!this.waiter.is("running")) {
      throw new Error(
        "Can't send. Bee not flying. (state:" + this.waiter.getState() + ")"
      );
    }

    //async, because caller will not be ready here.

    then(() => {
      if ((data as any)?.type === "shutdown") {
        this.kill();
      } else {
        this.beehavior.onSend && this.beehavior.onSend(data, this);
      }
    });
  };

  /**
   * the messages that the bee sends back.
   */
  public sendBack = (data: MR) => {
    if (this.terminated) {
      console.log( "InMemoryBee terminated, so user will not receive this message", data ); // prettier-ignore
      return;
    }

    this.waiter.event("message");

    this.deps.onMessage(data);
  };

  /**
   *
   */
  public terminate = () => {
    if (this.beehavior.requireGracefulShutdown && !this.isGraceful) {
      throw new Error("I expected more kindness.");
    }

    this.waiter.set("stopped");

    if (!this.terminated) {
      Promise.resolve().then(() => {
        this.deps.onExit();
      });
    }

    this.terminated = true;
  };

  /**
   *
   */
  public shutdown = () => {
    this.isGraceful = true;
    return this.waiter.shutdown(this.terminate);
  };

  public noisyKill = () => this.waiter.noisyKill(this.terminate, "InMemoryBee");

  public kill = () => this.waiter.kill(this.terminate);

  public is = (state: BeeStates) => this.waiter.is(state);
}
