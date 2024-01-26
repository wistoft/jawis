import { then } from "^yapu";
import { Waiter } from "^state-waiter";

import { Bee, BeeDeps, BeeShutdownMessage } from "./internal";

type States = "running" | "stopping" | "stopped";
type Events = "message";

type Beehavior<MS extends {}, MR extends {}> = {
  onInit?: (bee: InMemoryBee<MS, MR>) => void;
  onSend?: (
    data: BeeShutdownMessage | MS,
    bee: InMemoryBee<MS, MR>
  ) => Promise<void>;
  onTerminate?: (bee: InMemoryBee<MS, MR>) => void;
};

/**
 *
 */
export class InMemoryBee<MS extends {}, MR extends {}> implements Bee<MS> {
  public waiter: Waiter<States, Events>;

  private terminated = false;

  /**
   *
   */
  constructor(public deps: BeeDeps<MR>, private beehavior: Beehavior<MS, MR>) {
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
   * async, because caller will not be ready to handle sync, when it sending.
   *
   */
  public send = (data: BeeShutdownMessage | MS) => {
    if (!this.waiter.is("running")) {
      return Promise.reject(
        new Error(
          "Can't send. Bee not flying. (state:" + this.waiter.getState() + ")"
        )
      );
    }

    return then(
      () => this.beehavior.onSend && this.beehavior.onSend(data, this)
    );
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
    Promise.resolve()
      .then(
        () => this.beehavior.onTerminate && this.beehavior.onTerminate(this)
      )
      .then(() => {
        this.terminated = true;
        this.deps.onExit(0);
      });
  };

  /**
   *
   */
  public shutdown = () => this.waiter.shutdown(this.terminate, true);

  public noisyKill = () =>
    this.waiter.noisyKill(this.terminate, "InMemoryBee", true);

  public kill = () => this.waiter.kill(this.terminate, true);
}
