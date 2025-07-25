import {
  def,
  assert,
  err,
  LogProv,
  assertNever,
  prej,
  AbsoluteFile,
  GetAbsoluteSourceFile,
} from "^jab";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";
import { Bee, BeeDeps, MakeBee } from "^bee-common";

import { ReusableWPP, WatchableProcessPreloaderDeps } from "./internal";

//just a subset of bee.
export type ProcessRestarterProv<MS> = {
  send: (msg: MS) => void;
  kill: () => Promise<void>;
  noisyKill: () => Promise<void>;
};

export type ProcessRestarterDeps<MR> = Omit<BeeDeps<MR>, "onExit"> & {
  makeBee: MakeBee;
  getAbsoluteSourceFile?: GetAbsoluteSourceFile;
  onRestarted: () => void;
  onUnexpectedExit: () => void;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
  customBooter?: AbsoluteFile;
};

type States =
  | "initial"
  | "starting"
  | "running"
  | "restarting-stopping"
  | "restarting-starting"
  | "stopping"
  | "done";

type Events = never;

/**
 *
 * Maintains a consistent process on a changing codebase. The process is restarted when source files
 *  change, and a restarted event is sent to the user. The user can assume, that
 *  the process always runs on a consistent codebase. But the user have must accept, that the process can
 *  get killed at any time. And messages may get lost.
 *
 * overall
 *
 * - Messages send before onRestarted are guaranteed to be delivered to the previous process, and messages after
 *    onRestarted is guranteed to be delivered to the new process.
 * - Only supports processes that remain running. No support for scripts, that exit by themselves.
 *
 * details
 *
 * - There's no shutdown for this (only kill). Because the managed process is inherently unstable. Source files
 *     can change under it, so a clean shutdown is not particularly meaningful.
 * - Messages are dropped during process-restart. Pretends the process received the messages, but never had the
 *      change to respond to it. It's easier to implement, and consistent with specs.
 *
 * todo
 *  buffered messages are really not needed. Could just drop messages in initial-state, and emit `onRestarted` at first start as well.
 *    then states `restarting-starting` and `starting` can be merged.
 *
 */
export class ProcessRestarter<MR extends {}, MS extends {}>
  implements ProcessRestarterProv<MS>
{
  public waiter: Waiter<States, Events>;

  private rwpp: ReusableWPP<MR, MS>;

  private proc?: Bee<MS>;
  private bufferedMessages: Array<any> = [];

  private procInitProm!: Promise<Bee<MS>>;
  private procKillProm?: Promise<void>;

  /**
   *
   */
  constructor(private deps: ProcessRestarterDeps<MR>) {
    this.deps.finally(() => this.noisyKill()); //must be before the ReusableWPP, because we want to shutdown, before it.

    //must be first, because listeners depend on it.
    this.waiter = new Waiter<States, Events>({
      onError: deps.onError,
      startState: "initial",
      stoppingState: "stopping",
      endState: "done",
    });

    try {
      this.rwpp = new ReusableWPP(this.getProcessDeps());
    } catch (e) {
      this.waiter.set("done");
      throw e;
    }
  }

  /**
   *
   */
  public send = (msg: MS) => {
    const state = this.waiter.getState();

    switch (state) {
      case "initial":
        this.firstInitProcess();
      //fall through

      case "starting":
        this.bufferedMessages.push(msg);
        return;

      case "running":
        def(this.proc).send(msg);
        return;

      case "restarting-starting":
      case "restarting-stopping":
        return;

      case "stopping":
      case "done":
        throw new Error("Can't send in this state: " + this.waiter.getState());

      default:
        return assertNever(state);
    }
  };

  /**
   * Public for tests.
   */
  public restart = () => {
    if (this.waiter.is("stopping") || this.waiter.is("restarting-stopping")) {
      //this can happen between the process kill signal is sent, and the process exits, where
      //  WPP removes the watchers.

      //Maybe WPP could remove on kill/shutdown also. But it's still to brittle to rely on a
      //  sync kill. E.g. ReusableWPP is killed first, then the process async after. Why shouldn't
      //  that be allowed.

      //So a file change event can happen until `proc.kill()` have resolved.
      return;
    }

    if (!this.waiter.is("running")) {
      err(
        "Impossible to need restart, when not running. (state:" +
          this.waiter.getState() +
          ")"
      );
    }

    this.waiter.set("restarting-stopping");

    this.procKillProm = def(this.proc).kill();

    this.procKillProm.then(() => {
      //guard against possible kill.
      if (this.waiter.is("restarting-stopping")) {
        this.waiter.set("restarting-starting");
        this.initProcess().then(this.onStarted);
      }
    });
  };

  /**
   *
   */
  public firstInitProcess = () => {
    assert(
      this.waiter.is("initial"),
      "Only allow in initial state, currrent state: " + this.waiter.getState()
    );

    this.waiter.set("starting");

    this.initProcess().then(this.onStarted).catch(this.deps.onError);
  };

  /**
   *
   */
  private initProcess = () => {
    assert(
      this.waiter.is("starting") || this.waiter.is("restarting-starting"),
      "Wrong state: " + this.waiter.getState()
    );

    this.procInitProm = this.rwpp.useBee(this.getProcessDeps());

    return this.procInitProm;
  };

  /**
   *
   */
  private sendBufferedMessages = () => {
    for (const msg of this.bufferedMessages) {
      def(this.proc).send(msg);
    }

    this.bufferedMessages = [];
  };

  /**
   *
   */
  private onStarted = (proc: Bee<MS>) => {
    const state = this.waiter.getState();

    switch (state) {
      case "starting":
        this.proc = proc;
        this.waiter.set("running");
        this.sendBufferedMessages();
        return;

      case "restarting-starting":
        assert(
          this.bufferedMessages.length === 0,
          "Messages should have been dropped in restarting state."
        );

        this.proc = proc;
        this.waiter.set("running");
        this.deps.onRestarted();
        return;

      case "initial":
      case "running":
      case "restarting-stopping":
      case "stopping":
      case "done":
        this.deps.logProv.log(
          "Impossible to receive started-event, when (state:" +
            this.waiter.getState() +
            ")"
        );
        return;

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  private onExit = () => {
    if (this.waiter.is("stopping") || this.waiter.is("restarting-stopping")) {
      //expected exit
      return;
    }

    this.deps.onUnexpectedExit();
  };

  /**
   *
   */
  private getProcessDeps = (): BeeDeps<MR> & WatchableProcessPreloaderDeps => ({
    onRestartNeeded: this.restart,
    onScriptRequired: () => {},
    logProv: this.deps.logProv,

    //for WatchableProcessPreloader
    makeBee: this.deps.makeBee,
    getAbsoluteSourceFile: this.deps.getAbsoluteSourceFile,
    customBooter: this.deps.customBooter,

    //for makeBee
    def: {
      filename: this.deps.def.filename,
      data: this.deps.def.data,
    },
    onMessage: this.deps.onMessage,
    onLog: this.deps.onLog,
    onStdout: this.deps.onStdout,
    onStderr: this.deps.onStderr,
    onError: this.deps.onError,
    onExit: this.onExit,

    finally: this.deps.finally,
  });

  /**
   *
   */
  public kill = () => this.waiter.kill(this.realKiller, true);

  public noisyKill = () =>
    this.waiter.noisyKill(this.realKiller, "ProcessRestarter", true);

  /**
   *
   */
  private realKiller = () => {
    const state = this.waiter.getState();

    switch (state) {
      case "initial":
        return this.rwpp.kill();

      case "starting":
      case "restarting-starting":
        return this.rwpp.kill();

      case "running":
        //the order doesn't really matter.
        return this.rwpp.kill().finally(() => def(this.proc).kill());

      case "restarting-stopping":
        //already killing, so just wait for that promise.
        return this.rwpp.kill().finally(() => this.procKillProm);

      case "stopping":
        return prej(
          "Impossible: Because waiter protects against calling shutdown twice."
        );

      case "done":
        return prej("Impossible that kill is performed, when in done state.");

      default:
        return assertNever(state);
    }
  };
}
