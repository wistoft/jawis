export type { MainProv } from "^jab";

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
