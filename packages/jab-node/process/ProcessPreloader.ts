import path from "path";

import { err, LogProv } from "^jab";

import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";
import { Bee, BeeListeners, MakeBee } from "^bee-common";
import { TS_TIMEOUT } from ".";

//can't be in main, couldn't be required there.
export type BooterMessage = {
  type: "ready";
};

export type PreloaderMessage = {
  type: "startScript";
  script: string;
};

export type ProcessPreloaderDeps = {
  filename: string;
  customBooter?: string;
  timeout?: number;
  makeBee: MakeBee; //can be a process, worker, who knows.
  onExit?: (exitCode: number | null) => void; //used for errors before 'use'.
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
};

type States = "starting" | "ready" | "stopping" | "done";

/**
 *
 * - Shutdown will be ignored, if a use is in progress.
 * - Kill will always be performed, except in done state.
 * - Assert stopped in when finally function is called.
 *
 * Note
 *  - listeners are switched from own listeners to user's listeners, when the process is used.
 *  - shutdown can and do use kill. Because there's no state in the process to think of.
 *
 * todo:
 *  The transitions are not tight enough. wrt shutdown and kill.
 */
export class ProcessPreloader<MS extends {}> {
  public waiter: Waiter<States, never>;

  private listeners: BeeListeners<BooterMessage>;
  private proc: Bee<PreloaderMessage>;

  //We start TypeScript, so we need a large timeout :-)
  private timeout = TS_TIMEOUT;

  //extra state, corresponding to starting-use, ready-use.
  private inUse = false;

  /**
   *
   */
  constructor(private deps: ProcessPreloaderDeps) {
    //must be before the process, because we want to shutdown, before it.

    this.deps.finally(() => this.noisyKill());

    //things depend on this.

    this.waiter = new Waiter<States, never>({
      onError: this.deps.onError,
      startState: "starting",
      stoppingState: "stopping",
      endState: "done",
    });

    const booter = this.deps.customBooter
      ? this.deps.customBooter
      : path.join(__dirname, "ProcessPreloaderMain");

    if (this.deps.timeout) {
      this.timeout = this.deps.timeout;
    }

    // console.log("preload");

    this.listeners = this.getOwnListeners();

    try {
      this.proc = this.deps.makeBee({
        filename: booter,
        finally: this.deps.finally,
        onMessage: this.onMessage,
        onStdout: this.onStdout,
        onStderr: this.onStderr,
        onError: this.onError,
        onExit: this.onExit,
      });
    } catch (e) {
      this.waiter.set("done");
      throw e;
    }
  }

  /**
   *
   */
  public useProcess = <MR extends {}>(
    listeners: BeeListeners<MR>
  ): Promise<Bee<MS>> => {
    if (this.inUse) {
      return Promise.reject(new Error("The bee is already used."));
    }

    this.inUse = true;

    // wait for ready signal

    return this.waiter.await("ready", this.timeout).then(() => {
      //this shouldn't be able to happen.

      if (this.waiter.is("done")) {
        err("Impossible");
      }

      //switch to the user's listeners

      this.listeners = listeners as BeeListeners<any>;

      //start script

      this.proc.send({ type: "startScript", script: this.deps.filename });

      //done

      this.waiter.set("done");

      //return the process

      return this.proc as any;
    });
  };

  private onMessage = (msg: BooterMessage) => {
    this.listeners.onMessage(msg);
  };

  private onStdout = (data: Buffer) => {
    this.listeners.onStdout(data);
  };

  private onStderr = (data: Buffer) => {
    this.listeners.onStderr(data);
  };

  private onError = (error: unknown) => {
    this.listeners.onError(error);
  };

  private onExit = (exitCode: number | null) => {
    this.listeners.onExit(exitCode);
  };

  /**
   *
   */
  private getOwnListeners = (): BeeListeners<BooterMessage> => ({
    onMessage: (msg: BooterMessage) => {
      if (msg.type !== "ready") {
        throw err("Expected only to receive ready signal: ", msg);
      }
      this.waiter.set("ready");
    },

    onStdout: (data) => {
      this.deps.logProv.logStream("ProcessPreloader.stdout", data.toString());

      //allow stdout for debugging. So we don't cancel waiter.
    },

    onStderr: (data) => {
      //stderr is considered fatal.

      this.deps.logProv.logStream("ProcessPreloader.stderr", data.toString());

      this.waiter.cancel("Unexpected stderr: ProcessPreloaderMain");
    },

    onError: this.deps.onError,

    onExit: (exitCode: number | null) => {
      const state = this.waiter.getState();

      if (state !== "stopping") {
        if (this.waiter.hasWaiter()) {
          this.waiter.cancel(
            "Unexpected exit: ProcessPreloaderMain. Has waiter. State: " + state
          );
        } else {
          this.deps.logProv.log(
            "Unexpected exit: ProcessPreloaderMain. Has no waiter. State: " +
              state
          );
        }
      }

      this.waiter.set("done");

      if (this.deps.onExit) {
        this.deps.onExit(exitCode);
      }
    },
  });

  /**
   *
   * - When `useProcess` in progress, shutdown have no effect. The process is regarded as
   *    belonging to the 'user'.
   */
  public shutdown = () => {
    if (this.inUse) {
      return Promise.resolve();
    }

    return this.waiter.shutdown(() => this.proc.kill(), true);
  };

  public cancel = (msg?: string) => this.waiter.cancel(msg);

  public noisyKill = () =>
    this.waiter.noisyKill(() => this.proc.kill(), "ProcessPreloader");

  public kill = () => this.waiter.kill(() => this.proc.kill());
}
