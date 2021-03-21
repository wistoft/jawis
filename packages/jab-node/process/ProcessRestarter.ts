import { Serializable } from "child_process";

import {
  def,
  assert,
  err,
  FinallyFunc,
  LogProv,
  assertNever,
  looping,
  prej,
  Waiter,
  getPromise,
  PromiseTriple,
} from "^jab";

import { Bee, BeeDeps, BeeListeners, MakeBee } from "..";
import { ReusableWPP, WatchableProcessPreloaderDeps } from ".";

export type ProcessRestarterDeps<MR extends Serializable> = Omit<
  BeeListeners<MR>,
  "onExit"
> & {
  filename: string;
  filterRequireMessages?: boolean;
  makeBee: MakeBee;
  onRestarted: () => void;
  onUnexpectedExit: () => void;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
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
 * bug
 *  buffered messages are not ensured to be send completely, before new 'send commands' are also send. They may loose ordering.
 *
 */
export class ProcessRestarter<
  MR extends Serializable,
  MS extends Serializable
> {
  public waiter: Waiter<States, Events>;

  private rwpp: ReusableWPP<MR, MS>;

  private proc?: Bee<MS>;
  private bufferedMessages: Array<any> = [];

  private sendProm?: PromiseTriple<void>;
  private procInitProm!: Promise<Bee<MS>>;
  private procKillProm?: Promise<void>;

  /**
   *
   */
  constructor(private deps: ProcessRestarterDeps<MR>) {
    this.deps.finally(() => this.noisyKill()); //must be before the Angel, because we want to shutdown, before it.

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

        if (!this.sendProm) {
          this.sendProm = getPromise();
        }

        return this.sendProm.promise;

      case "running":
        return def(this.proc).send(msg);

      case "restarting-starting":
      case "restarting-stopping":
        return Promise.resolve();

      case "stopping":
      case "done":
        return Promise.reject(
          new Error("Can't send in this state: " + this.waiter.getState())
        );

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
      //  sync kill. E.g. angel is killed first, then the process async after. Why shouldn't
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
      //gaurd against possible kill.
      if (this.waiter.is("restarting-stopping")) {
        this.waiter.set("restarting-starting");
        this.initProcess().then(this.onStarted).catch(this.squashCancel);
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

    this.initProcess()
      .then(this.onStarted)
      .catch(this.squashCancel)
      .catch(this.deps.onError);
  };

  /**
   *
   */
  private initProcess = () => {
    assert(
      this.waiter.is("starting") || this.waiter.is("restarting-starting"),
      "Wrong state: " + this.waiter.getState()
    );

    this.procInitProm = this.rwpp.useProcess(this.getProcessDeps());

    return this.procInitProm;
  };

  /**
   * todo
   *  messages should just be send sync, and then await the all promises afterwards.
   */
  private sendBufferedMessages = () => {
    if (this.bufferedMessages.length === 0) {
      return;
    }

    //there are buffered messages

    return looping(this.bufferedMessages, (msg) => def(this.proc).send(msg))
      .then(() => {
        this.bufferedMessages = [];
        def(this.sendProm).resolve();
      })
      .catch((error) => def(this.sendProm).reject(error));
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
  public onExit = () => {
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
    filterRequireMessages: this.deps.filterRequireMessages,
    makeBee: this.deps.makeBee,

    //for Process
    filename: this.deps.filename,
    onMessage: this.deps.onMessage,
    onStdout: this.deps.onStdout,
    onStderr: this.deps.onStderr,
    onError: this.deps.onError,
    onExit: this.onExit,

    finally: this.deps.finally,
  });

  /**
   *
   */
  private squashCancel = (error: Error) => {
    if (this.waiter.is("stopping") && Waiter.isCancel(error)) {
      return;
    }

    throw error; //everything else is re-thrown
  };

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
        this.rwpp.cancel();

        return this.rwpp
          .kill()
          .then(() =>
            this.procInitProm
              .then(() =>
                err("The proc should have been cancelled by Angel.kill()")
              )
              .catch(this.squashCancel)
          );

      case "running":
        //the order doesn't really matter.
        return this.rwpp.kill().finally(() => def(this.proc).kill());

      case "restarting-stopping":
        //already killing, so just wait for that promise.
        return this.rwpp.kill().finally(() => this.procKillProm);

      case "stopping":
        //logically, there is nothing to do. This should already be shutting down.
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
//
