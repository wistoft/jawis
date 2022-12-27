import cp, {
  ChildProcess,
  StdioOptions,
  Serializable,
  ForkOptions,
} from "child_process";
import { JabShutdownMessage } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";

export type ProcessDeps<MR extends Serializable> = {
  filename: string;
  execArgv?: string[];
  stdio?: StdioOptions;
  cwd?: string;
  env?: {
    [key: string]: string;
  };
  finally: FinallyFunc;
} & ProcessListeners<MR>;

export type ProcessListeners<MR extends Serializable> = {
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
 */
export class Process<MR extends Serializable, MS extends Serializable> {
  public cp: ChildProcess;

  public waiter: Waiter<States, Events>;

  /**
   *
   */
  constructor(private deps: ProcessDeps<MR>) {
    //must be first, because listeners depend on it.
    this.waiter = new Waiter<States, Events>({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //start process

    this.cp = this.getStartedProcess();

    this.addOwnListeners();

    //deps handlers

    this.addDepListeners(deps);

    // done

    this.waiter.set("running");

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  public send = (obj: JabShutdownMessage | MS) => {
    if (!this.waiter.is("running")) {
      return Promise.reject(
        new Error(
          "Can't send. Process not running." +
            " (state:" +
            this.waiter.getState() +
            ")"
        )
      );
    }
    return this.rawSend(obj);
  };

  /**
   * Not needed.
   */
  private rawSend = (obj: JabShutdownMessage | MS) =>
    new Promise<void>((resolve, reject) => {
      this.cp.send(obj, (error) => {
        if (error === null) {
          resolve();
        } else {
          reject(error);
        }
      });
    });

  /**
   * Anti-pattern to change the app structure. Better with static structure, and have logic in listeners.
   */
  public removeAllListeners = () => {
    //almost all
    this.cp.removeAllListeners();

    //the pipes

    if (this.cp.stdout) {
      this.cp.stdout.removeAllListeners();
    }

    if (this.cp.stderr) {
      this.cp.stderr.removeAllListeners();
    }

    //re-add own listeners.

    this.addOwnListeners(); //a little hacky, but it should work.
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

    return cp.fork(this.deps.filename, [], options);
  };

  /**
   *
   */
  private addOwnListeners = () => {
    this.cp.on("message", this.onMessage);
    this.cp.on("error", this.onError);
    this.cp.on("exit", this.onExit);
  };

  /**
   *
   */
  private addDepListeners = (listeners: ProcessListeners<MR>) => {
    this.cp.on("message", (data: MR) => {
      try {
        listeners.onMessage(data);
      } catch (any) {
        const e = any as unknown;
        listeners.onError(e);
      }
    });

    if (this.cp.stdout) {
      this.cp.stdout.on("data", listeners.onStdout);
    }

    if (this.cp.stderr) {
      this.cp.stderr.on("data", listeners.onStderr);
    }

    this.cp.on("error", listeners.onError);
    this.cp.on("exit", listeners.onExit);

    if (listeners.onClose) {
      this.cp.on("close", listeners.onClose);
    }
  };

  /**
   *
   */
  private onMessage = (msg: unknown) => {
    this.waiter.event("message", msg);
  };

  /**
   *
   */
  private onError = (error: Error) => {
    this.waiter.onErrorOld(error);

    //an attempt to detect, when spawn file doesn't exist: "spawn ENOENT"

    if (this.cp.pid === undefined && this.cp.exitCode === -4058) {
      this.waiter.set("stopped");
    }
  };

  /**
   *
   */
  private onExit = () => {
    this.waiter.set("stopped");

    //not possible, because the adding and removing of the listeners.
    // this.deps.onExit(status);
  };

  /**
   * note
   *  No need to check, the process is running, and can receive messages, because waiter will handle `stopping` and `done` state.
   */
  public shutdown = () =>
    this.waiter.shutdown(() => this.rawSend({ type: "shutdown" }));

  /**
   ** cp.kill can't run away from its class.
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.cp.kill(), "Process");

  public kill = () => this.waiter.kill(() => this.cp.kill());
}
