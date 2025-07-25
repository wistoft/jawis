import path from "path-browserify";

import { FinallyFunc } from "^finally-provider";
import {
  AbsoluteFile,
  assert,
  assertNever,
  def,
  err,
  LogEntry,
  LogProv,
  SendLog,
} from "^jab";
import { Waiter } from "^state-waiter";
import { getPromise, PromiseTriple } from "^yapu";

import {
  BeeDef,
  Bee,
  BeeListeners,
  MakeBee,
  BeePreloaderProv,
  BeeDeps,
} from "./internal";

export type BooterMessage = {
  type: "ready";
};

export type PreloaderMessage = {
  type: "startScript";
  def: BeeDef;
};

export type BeePreloaderDeps = {
  customBooter?: AbsoluteFile;
  makeBee: MakeBee;
  onExit?: () => void;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
  onLog: SendLog;
};

type States =
  | "starting"
  | "starting-using"
  | "ready"
  | "stopping"
  | "done"
  | "error";

/**
 *
 * - Shutdown will be ignored, if use in progress.
 * - kill will be performed, if use in progress.
 *    But what to do with the waiting usePromise
 * - Shutdown/kill will not affect bee, when returned by `useBee`.
 * - Assert stopped when finally function is called.
 *
 * Note
 *  - shutdown use kill, because there's no state in the bee to think of.
 *
 * todo:
 *  The transitions are not tight enough. wrt shutdown and kill.
 */
export class BeePreloader<MR extends {}, MS extends {}>
  implements BeePreloaderProv<MR, MS>
{
  public waiter: Waiter<States, never>;

  private listeners: BeeListeners<BooterMessage>;

  private usingPromise?: PromiseTriple<Bee<MS>>; //set when waiting for ready message. In starting-using state.

  private beeDeps?: BeeDeps<MR>; //set when waiting for ready message. In starting-using state.

  private bee: Bee<PreloaderMessage>;

  //extra state, corresponding to starting-use, ready-use.
  private inUse = false;

  /**
   *
   */
  constructor(private deps: BeePreloaderDeps) {
    //must be before the bee, because we want to shutdown, before it.

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
      : path.join(__dirname, "BeePreloaderMain");

    this.listeners = this.getOwnListeners();

    try {
      this.bee = this.deps.makeBee({
        def: {
          filename: booter,
        },
        finally: this.deps.finally,
        onMessage: this.onMessage,
        onLog: this.onLog,
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
  public useBee = (deps: BeeDeps<MR>): Promise<Bee<MS>> => {
    this.inUse = true;

    const state = this.waiter.getState();

    switch (state) {
      case "starting":
        this.waiter.set("starting-using");

        this.beeDeps = deps;
        this.usingPromise = getPromise<Bee<MS>>();

        return this.usingPromise.promise;

      case "ready":
        return Promise.resolve(this.realUseBee(deps));

      case "starting-using":
      case "stopping":
      case "done":
      case "error":
        return Promise.reject(new Error("Can't use bee in state: " + state));

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  public realUseBee = (deps: BeeDeps<MR>): Bee<MS> => {
    //switch to the user's listeners

    this.listeners = deps as BeeListeners<any>;

    //start script

    this.bee.send({
      type: "startScript",
      def: deps.def,
    });

    //done

    this.waiter.set("done");

    //return the bee

    return this.bee as any;
  };

  private onMessage = (msg: BooterMessage) => {
    this.listeners.onMessage(msg);
  };

  private onLog = (entry: LogEntry) => {
    this.listeners.onLog(entry);
  };

  private onStdout = (data: Buffer | string) => {
    this.listeners.onStdout(data);
  };

  private onStderr = (data: Buffer | string) => {
    this.listeners.onStderr(data);
  };

  private onError = (error: unknown) => {
    this.listeners.onError(error);
  };

  private onExit = () => {
    this.listeners.onExit();
  };

  /**
   *
   */
  private getOwnListeners = (): BeeListeners<BooterMessage> => ({
    onMessage: (msg: BooterMessage) => {
      if (msg.type !== "ready") {
        throw err("Expected only to receive ready signal: ", msg);
      }

      const state = this.waiter.getState();

      switch (state) {
        case "starting":
          this.waiter.set("ready");
          return;

        case "starting-using":
          def(this.usingPromise).resolve(this.realUseBee(def(this.beeDeps)));
          this.usingPromise = undefined;
          this.waiter.set("done");
          return;

        case "stopping":
          //can just be ignored
          return;

        case "ready":
        case "done":
        case "error":
          this.deps.onError(new Error("Impossible: " + state));
          return;

        default:
          return assertNever(state);
      }
    },

    onLog: (entry) => {
      this.deps.onLog(entry);

      //allow logs for debugging. So we don't cancel waiter.
    },

    onStdout: (data) => {
      this.deps.logProv.logStream("BeePreloader.stdout", data.toString());

      //allow stdout for debugging. So we don't cancel waiter.
    },

    onStderr: (data) => {
      //stderr is considered fatal.

      this.deps.logProv.logStream("BeePreloader.stderr", data.toString());

      this.tryRejectUsingPromise("Unexpected stderr: BeePreloaderMain");
    },

    onError: this.waiter.onError,

    onExit: () => {
      const state = this.waiter.getState();

      assert(state !== "done");

      if (!this.waiter.is("stopping")) {
        if (this.usingPromise) {
          this.tryRejectUsingPromise(
            "Unexpected exit in BeePreloaderMain in state: " + state
          );
        } else {
          this.deps.logProv.log(
            "Unexpected exit in BeePreloaderMain in state: " + state
          );
        }
      }

      this.waiter.set("done");

      if (this.deps.onExit) {
        this.deps.onExit();
      }
    },
  });

  /**
   *
   */
  private tryRejectUsingPromise = (msg: string) => {
    if (this.usingPromise) {
      this.usingPromise.reject(new Error(msg));
      this.usingPromise = undefined;
    }
  };

  /**
   *
   * - When `useBee` in progress, shutdown have no effect. The bee is regarded as
   *    belonging to the 'user'.
   */
  public shutdown = () => {
    if (this.inUse) {
      return Promise.resolve();
    }

    return this.waiter.shutdown(() => this.bee.kill(), true);
  };

  public noisyKill = () =>
    this.waiter.noisyKill(() => this.bee.kill(), "BeePreloader");

  public kill = () => this.waiter.kill(() => this.bee.kill());
}
