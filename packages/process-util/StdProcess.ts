import cp, { ChildProcess, StdioOptions } from "node:child_process";

import { Bee, BeeStates } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";
import { assert } from "^jab";

export type StdProcessDeps = {
  filename: string;
  args?: string[];
  stdio?: StdioOptions;
  cwd?: string;
  env?: {
    [key: string]: string | undefined;
  };
  shell?: boolean | string;
  finally: FinallyFunc;
} & StdProcessListeners;

export type StdProcessListeners = {
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: (status: number | null) => void;
  onClose?: () => void;
};

type States = "running" | "stopping" | "stopped";
type Events = never;

/**
 * - Implements the bee interface, so it's easy to make bees.
 *    - adds
 *      - stdin
 *      - args, env, cwd, etc
 *    - missing
 *      - send
 *      - onMessage
 *      - onLog
 *      - bee def (data & next)
 *      - shutdown (it's just kills)
 *
 */
export class StdProcess<MS = never> implements Bee<MS> {
  public cp: ChildProcess;

  public waiter: Waiter<States, Events>;

  private closed = false;
  private exited: number | null | false = false;

  private stdinWrites = 0; //just to ensure writes has finished before kill. Otherwise will stdin throw `write EOF`
  private needsKill = false;

  /**
   *
   */
  constructor(private deps: StdProcessDeps) {
    //must be first, because listeners depend on it.

    this.waiter = new Waiter<States, Events>({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //start process

    this.cp = this.getStartedProcess();

    //deps handlers

    this.cp.on("error", this.onError);
    this.cp.on("exit", this.onExit);

    if (this.cp.stdout) {
      this.cp.stdout.on("data", deps.onStdout);
    }

    if (this.cp.stderr) {
      this.cp.stderr.on("data", deps.onStderr);
    }

    this.cp.on("close", this.onClose);

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  private onError = (error: Error) => {
    this.waiter.onError(error);

    //an attempt to detect, when we need to manually call onExit.

    if (this.cp.pid === undefined) {
      this.onExit(null); //pseudo exit is needed, if the process never started.
    }
  };

  /**
   * will this always be called?
   */
  private onClose = () => {
    assert(this.exited !== false);
    this.closed = true;
    this.deps.onClose?.();

    this.checkDone();
  };

  /**
   *
   */
  private onExit = (status: number | null) => {
    this.exited = status;
    this.checkDone();
  };

  /**
   *
   */
  private checkDone = () => {
    if (this.closed && this.exited !== false) {
      this.waiter.set("stopped");

      this.deps.onExit(this.exited);
    }
  };

  /**
   *
   */
  private getStartedProcess = () => {
    const options: any = {
      stdio: this.deps.stdio || ["pipe", "pipe", "pipe"],
      shell: this.deps.shell,
    };

    if (this.deps.cwd) {
      options.cwd = this.deps.cwd;
    }

    if (this.deps.env) {
      options.env = this.deps.env;
    }

    return cp.spawn(this.deps.filename, this.deps.args || [], options);
  };

  /**
   *
   */
  public write = (str: string) => {
    if (!this.cp.stdin) {
      throw new Error("Stdin is not open.");
    }

    if (!this.waiter.is("running")) {
      throw new Error( "Can't write to stdin. Process not running." + " (state:" + this.waiter.getState() + ")" ); // prettier-ignore
    }

    //keep track of writes in progress.

    this.stdinWrites++;

    this.cp.stdin.write(str, () => {
      this.stdinWrites--;
      if (this.needsKill && this.stdinWrites === 0) {
        this.needsKill = false;
        this.cp.kill();
      }
    });
  };

  /**
   *
   */
  public send = () => {
    throw new Error("Not supported");
  };

  //can't do other than kill, because there's no knowledge of what's on the other side.
  public shutdown = () => this.kill();

  /**
   * cp.kill can't run away from its class.
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.realKill(), "Process");

  public kill = () => this.waiter.kill(() => this.realKill());

  public is = (state: BeeStates) => this.waiter.is(state);

  /**
   *
   */
  public realKill = () => {
    if (this.stdinWrites === 0) {
      this.cp.kill();
    } else {
      this.needsKill = true;
    }
  };
}
