import path from "path";
import { Worker, MessagePort } from "worker_threads";

import { def, err } from "^jab";

import { nodeRequire, StructuredCloneable } from "..";
import type { JabShutdownMessage, MakeNodeWorker } from ".";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";

export type JabWorkerDeps<MR, WD> = {
  filename: string;
  workerData?: WD;

  onMessage: (msg: MR) => void;
  onStdout?: (data: Buffer) => void;
  onStderr?: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: (exitCode: number) => void;

  makeWorker: MakeNodeWorker;

  finally: FinallyFunc;
};

type States = "running" | "stopping" | "stopped";
type Events = "message";

/**
 * - Handles .ts extensions.
 * - Supports compiling typescript.
 * - Resolve the file, if it doesn't end on ".js". So it can have no file ending.
 *      e.g. /some/file will turn into /some/file.js or /some/file.ts
 *      This alleviates the requirement, that filenames must have the file ending ".js", they wont be resolve like for processes.
 *
 * - If stdout/stderr handlers aren't specified will the streams go to this process's streams. And be intermixed :(
 * - If stdout/stderr handlers are specified, it won't be possible to unref the worker. :(
 * - The thread must handle a JabShutdownMessage
 * - execArgv not supported.
 */
export class JabWorker<
  MS extends StructuredCloneable,
  MR extends StructuredCloneable,
  WD extends StructuredCloneable
> {
  public worker: Worker;

  public waiter: Waiter<States, Events>;

  /**
   *
   */
  constructor(private deps: JabWorkerDeps<MR, WD>) {
    if (!path.isAbsolute(deps.filename)) {
      err("filename must be absolute.", deps.filename);
    }

    //waiter

    this.waiter = new Waiter<States, Events>({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //resolve unspecified file types.

    let realFilename: string;
    if (!deps.filename.endsWith(".js")) {
      realFilename = nodeRequire.resolve(deps.filename);
    } else {
      realFilename = deps.filename;
    }

    //optional

    const stdout = this.deps.onStdout !== undefined;
    const stderr = this.deps.onStderr !== undefined;

    //worker

    this.worker = this.deps.makeWorker(realFilename, {
      stdout,
      stderr,
      workerData: deps.workerData,
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
    data: JabShutdownMessage | MS,
    transferList?: Array<ArrayBuffer | MessagePort>
  ) => {
    if (!this.waiter.is("running")) {
      return Promise.reject(
        new Error(
          "Can't send. Thread not running. (state:" +
            this.waiter.getState() +
            ")"
        )
      );
    }

    return Promise.resolve().then(() =>
      this.worker.postMessage(data, transferList)
    );
  };

  /**
   *
   */
  private onMessage = (msg: MR) => {
    this.deps.onMessage(msg);

    this.waiter.event("message", msg);
  };

  /**
   *
   */
  private onExit = (exitCode: number) => {
    this.waiter.set("stopped");

    this.deps.onExit(exitCode);
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
}
