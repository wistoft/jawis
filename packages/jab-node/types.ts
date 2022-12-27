import { FinallyProvider } from "^finally-provider";
import type { LogProv, OnError } from "^jab";

//covenience: duplicates some properties to be compatible with TestMainProv
export type MainProv = {
  onError: OnError;

  finalProv: FinallyProvider;
  finally: FinallyProvider["finally"]; //covenience

  logProv: LogProv;
  log: LogProv["log"]; //covenience
  logStream: LogProv["logStream"]; //covenience
};

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
