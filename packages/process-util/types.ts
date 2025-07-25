import { Worker, WorkerOptions } from "node:worker_threads";
import { AbsoluteFile } from "^jab";

export type SpawnResult = {
  stdout: string;
  stderr: string;
  status: number | null;
};

export type SimpleExec = (
  filename: string,
  args?: string[],
  cwd?: string
) => Promise<SpawnResult>;

/**
 * URL for filename not supported, yet.
 *
 *  - Abstract to allow same interface for plain and ts workers.
 */
export type MakeNodeWorker = (
  filename: AbsoluteFile,
  options?: WorkerOptions
) => Worker;
