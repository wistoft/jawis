import cp, {
  ChildProcess,
  StdioOptions,
  Serializable,
  ForkOptions,
} from "node:child_process";

import { Bee, BeeStates, BeeShutdownMessage } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";

export type NodeProcessDeps<MR extends Serializable> = {
  filename: string;
  args?: string[];
  execArgv?: string[];
  stdio?: StdioOptions;
  cwd?: string;
  env?: {
    [key: string]: string | undefined;
  };
  finally: FinallyFunc;
} & NodeProcessListeners<MR>;

export type NodeProcessListeners<MR extends Serializable> = {
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
 * Only for node processes.
 *
 * - execArgv is default [], not process.execArgv.
 * - Implements the bee interface, so it's easy to make worker bees. See `makePlainProcessBee`.
 */
export class NodeProcess<MR extends Serializable, MS extends Serializable>
  implements Bee<MS>
{
  public cp: ChildProcess;

  public waiter: Waiter<States, Events>;

  /**
   *
   */
  constructor(private deps: NodeProcessDeps<MR>) {
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

    if (deps.onClose) {
      this.cp.on("close", deps.onClose);
    }

    this.cp.on("message", (data: MR) => {
      this.waiter.event("message", data);

      try {
        deps.onMessage(data);
      } catch (error) {
        deps.onError(error);
      }
    });

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
   *
   */
  private onExit = (code: number | null) => {
    this.waiter.set("stopped");

    this.deps.onExit(code);
  };

  /**
   *
   */
  public send = (obj: BeeShutdownMessage | MS) => {
    if (!this.waiter.is("running")) {
      throw new Error( "Can't send. Process not running." + " (state:" + this.waiter.getState() + ")" ); // prettier-ignore
    }

    this.cp.send(obj, (error) => {
      if (error) {
        this.deps.onError(error);
      }
    });
  };

  /**
   *
   */
  private getStartedProcess = () => {
    const options: ForkOptions = {
      execArgv: this.deps.execArgv || [],
      stdio: this.deps.stdio || ["pipe", "pipe", "pipe", "ipc"],
    };

    if (this.deps.cwd) {
      options.cwd = this.deps.cwd;
    }

    if (this.deps.env) {
      options.env = this.deps.env;
    }

    return cp.fork(this.deps.filename, this.deps.args || [], options);
  };

  /**
   * impl
   *  - Waiter guarantees, that the function passed to it is only called in running state.
   *      So it's no problem to send a message.
   */
  public shutdown = () =>
    this.waiter.shutdown(() => this.send({ type: "shutdown" }));

  /**
   ** cp.kill can't run away from its class.
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.cp.kill(), "Process");

  public kill = () => this.waiter.kill(() => this.cp.kill());

  public is = (state: BeeStates) => this.waiter.is(state);
}
