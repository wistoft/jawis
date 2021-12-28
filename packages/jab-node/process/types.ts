import type { Serializable } from "child_process";
import type { Worker, WorkerOptions } from "worker_threads";

import type { ProcessDeps, Process, JabWorker, JabWorkerDeps } from ".";
import { StructuredCloneable } from "^jab-node";

export type SpawnResult = {
  stdout: string;
  stderr: string;
  status: number | null;
};

/**
 * URL for filename not supported, yet.
 *
 *  - Abstract to allow same interface plain and workers supporting ts compile.
 */
export type MakeNodeWorker = (
  filename: string,
  options?: WorkerOptions
) => Worker;

/**
 *
 */
export type MakeJabProcess = <MR extends Serializable, MS extends Serializable>(
  deps: ProcessDeps<MR>
) => Process<MR, MS>;

/**
 *
 */
export type MakeJabWorker = <
  MS extends StructuredCloneable,
  MR extends StructuredCloneable,
  WD extends StructuredCloneable
>(
  deps: JabWorkerDeps<MR, WD>
) => JabWorker<MS, MR, WD>;
