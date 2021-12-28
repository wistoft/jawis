import cp, { ChildProcess, StdioOptions, Serializable } from "child_process";

import { Bee, BeeStates, FinallyFunc, Waiter } from "^jab";

export type RealProcessDeps<MR extends Serializable> = {
  filename: string;
  args?: string[];
  execArgv?: string[];
  stdio?: StdioOptions;
  cwd?: string;
  env?: {
    [key: string]: string | undefined;
  };
  shell?: boolean | string;
  namedPipeServer?: any; //a channel that's controlled by other means, but this should be regarded as ipc.
  finally: FinallyFunc;
} & RealProcessListeners<MR>;

export type RealProcessListeners<MR extends Serializable> = {
  onMessage: (msg: MR) => void;
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: (status: number | null) => void;
  onClose?: () => void;
};

type States = "running" | "stopping" | "stopped";
type Events = "message";

/**
 * - execArgv is default [], not process.execArgv.
 *
 * todo
 *  - consider messages.
 *  - rename to Process, and Process to NodeProcess
 */
export class RealProcess<MR extends Serializable, MS extends Serializable>
  implements Bee<MS> {
  public cp: ChildProcess;

  public waiter: Waiter<States, Events>;

  /**
   *
   */
  constructor(private deps: RealProcessDeps<MR>) {
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

    this.cp.addListener("error", this.waiter.onError);
    this.cp.addListener("exit", this.onExit);

    if (this.cp.stdout) {
      this.cp.stdout.on("data", this.deps.onStdout);
    }

    if (this.cp.stderr) {
      this.cp.stderr.on("data", this.deps.onStderr);
    }

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  private getStartedProcess = () => {
    const options: any = {
      stdio: this.deps.stdio || ["pipe", "pipe", "pipe"],
      execArgv: this.deps.execArgv || [],
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
  private onExit = (status: number | null) => {
    this.waiter.set("stopped");

    this.deps.onExit(status);
  };

  /**
   *
   */
  public send = () => {
    throw new Error("Not supported");
  };

  /**
   *
   */
  public realKill = () => {
    this.deps.namedPipeServer?.shutdown();
    this.cp.kill();
  };

  public shutdown = () => this.kill(); //quick fix, this is useful, where shutdown is needed. But it's not graceful as excepted.

  /**
   ** cp.kill can't run away from its class.
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.realKill(), "Process");

  public kill = () => this.waiter.kill(() => this.realKill());

  public is = (state: BeeStates) => this.waiter.is(state);
}
