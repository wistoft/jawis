import type { FinallyFunc, FinallyProvider, LogProv, Waiter } from "^jab";

import type { JabShutdownMessage } from ".";

export type MainProv = {
  onError: (error: unknown) => void;

  finalProv: FinallyProvider;
  finally: FinallyProvider["finally"]; //covenience

  logProv: LogProv;
  log: LogProv["log"];
  logStream: LogProv["logStream"];
};

//
// bee
//

export type BeeDeps<MR> = {
  filename: string;
  finally: FinallyFunc;
} & BeeListeners<MR>;

export type BeeListeners<MR> = {
  onMessage: (msg: MR) => void;
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: (exitCode: number | null) => void;
};

type BeeStates = "running" | "stopping" | "stopped";
type BeeEvents = "message";

export type Bee<MS> = {
  send: (msg: JabShutdownMessage | MS) => Promise<void>;
  shutdown: () => Promise<void>;
  kill: () => Promise<void>;
  noisyKill: () => Promise<void>;
  waiter: Waiter<BeeStates, BeeEvents>;
};

/**
 *
 */
export type MakeBee = <MS extends {}, MR extends {}>(
  deps: BeeDeps<MR>
) => Bee<MS>;

//
// not found in official places
//

//only used for Worker thread in node.
//  futile attempt to list all clonable values
//  see
//    https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist
//    https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

export type StructuredCloneable =
  | null
  | undefined
  | boolean
  | string
  | Date
  | BigInt
  | Array<unknown>
  | ArrayBuffer
  | ArrayBufferView
  | SharedArrayBuffer
  | RegExp
  | Set<unknown>
  | Map<unknown, unknown>
  | {};
