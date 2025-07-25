import path from "node:path";
import { Worker, MessagePort, WorkerOptions } from "node:worker_threads";

import { Bee, BeeStates, BeeShutdownMessage } from "^bee-common";
import { isProcessAlive, killProcess, StructuredCloneable } from "^jab-node";
import { MainFileDeclaration, def, err, tryProp } from "^jab";
import { Waiter } from "^state-waiter";
import { paralleling } from "^yapu";
import { FinallyFunc } from "^finally-provider";

export type JabWorkerDeps<MR, WD> = {
  filename: string;
  workerData?: WD;

  onMessage: (msg: MR) => void;
  onStdout?: (data: Buffer) => void;
  onStderr?: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: () => void;

  workerOptions?: WorkerOptions;
  collectSubprocesses?: boolean;

  finally: FinallyFunc;
};

type States = "running" | "stopping" | "stopped";
type Events = "message";

export const jabWorkerMainDeclaration: MainFileDeclaration = {
  type: "plain-file",
  file: "JabWorkerMain.js",
  folder: __dirname,
};

/**
 * Thin wrapper for node's worker thread.
 *
 * - Implements the bee interface, so it's easy to make worker bees. See `makePlainWorkerBee`.
 * - The thread must handle a JabShutdownMessage
 * - Makes it possible to collect the pids spawned by the worker. Note: will only work if ipc is activated.
 *
 * diverse
 *  - If stdout/stderr handlers aren't specified, then the streams go to this process's streams. And be intermixed
 *  - If stdout/stderr handlers are specified, it won't be possible to unref the worker.
 */
export class JabWorker<
  MS extends StructuredCloneable,
  MR extends StructuredCloneable,
  WD extends StructuredCloneable,
> implements Bee<MS>
{
  public worker: Worker;

  public waiter: Waiter<States, Events>;

  public pids: number[] = [];

  /**
   *
   */
  constructor(private deps: JabWorkerDeps<MR, WD>) {
    if (!path.isAbsolute(deps.filename)) {
      err("filename must be absolute.", deps.filename);
    }

    //waiter

    this.waiter = new Waiter({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //collect subprocesses

    let execArgv = deps.collectSubprocesses
      ? ["-r", path.join(__dirname, "JabWorkerMain.js")]
      : [];

    if (deps.workerOptions?.execArgv) {
      execArgv = [...execArgv, ...deps.workerOptions.execArgv];
    }

    //optional

    const stdout = this.deps.onStdout !== undefined;
    const stderr = this.deps.onStderr !== undefined;

    //worker

    this.worker = new Worker(deps.filename, {
      ...deps.workerOptions,
      stdout,
      stderr,
      workerData: deps.workerData,
      execArgv,
    });

    //listeners

    this.worker.addListener("message", this.onMessage);
    this.worker.addListener("error", this.waiter.onError);
    this.worker.addListener("exit", this.onExit);

    if (stdout) {
      this.worker.stdout.addListener("data", (data) => {
        def(this.deps.onStdout)(data);
      });
    }

    if (stderr) {
      this.worker.stderr.addListener("data", (data) => {
        def(this.deps.onStderr)(data);
      });
    }

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  public send = (
    data: BeeShutdownMessage | MS,
    transferList?: Array<ArrayBuffer | MessagePort>
  ) => {
    if (!this.waiter.is("running")) {
      throw new Error("Can't send. Thread not running. (state:" + this.waiter.getState() + ")") // prettier-ignore
    }

    this.worker.postMessage(data, transferList);
  };

  /**
   *
   */
  public hasSubprocesses = () => {
    if (!this.deps.collectSubprocesses) {
      throw new Error("Collect subprocesses was not enabled.");
    }

    this.pids = this.pids.filter(isProcessAlive);

    return this.pids.length !== 0;
  };

  /**
   * note
   *  - There can be child processes still running, when this returns. It cannot be guaranteed, that the
   *     process hasn't created new processes.
   */
  public killSubprocesses = async () => {
    if (!this.deps.collectSubprocesses) {
      throw new Error("Collect subprocesses was not enabled.");
    }

    const clone = [...this.pids];
    this.pids = [];

    await paralleling(clone, killProcess, this.deps.onError);
  };

  /**
   *
   */
  private onMessage = (msg: MR) => {
    if (tryProp(msg, "channel") === "jab_worker_channel_token") {
      this.pids.push((msg as any).pid);
    } else {
      //it's an ordinary message

      this.deps.onMessage(msg);

      this.waiter.event("message", msg);
    }
  };

  /**
   *
   */
  private onExit = () => {
    this.waiter.set("stopped");

    this.deps.onExit();
  };

  /**
   * note
   *  No need to check, the process is running, and can receive messages, because waiter will handle `stopping` and `done` state.
   */
  public shutdown = () =>
    this.waiter.shutdown(() => this.worker.postMessage({ type: "shutdown" }));

  /**
   * worker.terminate can't run away from its class. (it has to be bound)
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.worker.terminate(), "Worker");

  public kill = () => this.waiter.kill(() => this.worker.terminate());

  public is = (state: BeeStates) => this.waiter.is(state);
}
