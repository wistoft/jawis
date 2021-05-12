import type { Serializable } from "child_process";
import type { Worker, WorkerOptions } from "worker_threads";
import type { Bee, MakeBee, StructuredCloneable } from "..";

import type { ProcessDeps, Process, JabWorker, JabWorkerDeps } from ".";
import { FinallyFunc } from "^jab";

//
// scripts/exec
//

export type SpawnResult = {
  stdout: string;
  stderr: string;
  status: number | null;
};

export type BeeResult<MR> = {
  stdout: string;
  stderr: string;
  status: number | null;
  messages: MR[];
};

export type ExecBee = <MR extends {}, MS extends {}>(
  script: string,
  finallyFunc: FinallyFunc,
  makeBee: MakeBee
) => { bee: Bee<MS>; promise: Promise<BeeResult<MR>> };

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

//
// wpp
//

export type OnRequire = (msg: RequireSenderMessage) => void;

export type RequireSenderMessage = {
  type: "require";
  file: string;
  source?: string;
};
