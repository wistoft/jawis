import { FinallyFunc } from "^finally-provider";
import { CapturedValue, ErrorData } from "^jabc";
import { Waiter } from "^state-waiter";

export type JabShutdownMessage = {
  type: "shutdown";
};

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

/**
 * A bee is an abstaction over processes/workers.
 */
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
// messages, logs and output
//

export type JagoSend = (msg: JagoLogEntry) => void;

//
// log provision and jago logging convention.
//

export type LogEntry = {
  type: "log";
  data: CapturedValue[];
  logName?: string;
};

export type StreamEntry = {
  type: "stream";
  data: string;
  logName?: string;
};

export type HtmlEntry = {
  type: "html";
  data: string;
  logName?: string;
};

export type ErrorEntry = {
  type: "error";
  data: ErrorData;
  logName?: string;
};

export type JagoLogEntry = LogEntry | StreamEntry | HtmlEntry | ErrorEntry;

//
// add ons
//

export type ExecBee = <MR extends {}, MS extends {}>(
  script: string,
  finallyFunc: FinallyFunc,
  makeBee: MakeBee
) => { bee: Bee<MS>; promise: Promise<BeeResult<MR>> };

export type BeeResult<MR> = {
  stdout: string;
  stderr: string;
  status: number | null;
  messages: MR[];
  errors: unknown[];
};
