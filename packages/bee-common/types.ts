import { FinallyFunc } from "^finally-provider";
import { CapturedValue, ErrorData, OnError } from "^jab";
import { Waiter } from "^state-waiter";

export type BeeShutdownMessage = {
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

export type BeeStates = "running" | "stopping" | "stopped";
export type BeeEvents = "message";

/**
 * A bee is an abstaction over processes/workers.
 */
export type Bee<MS> = {
  send: (msg: BeeShutdownMessage | MS) => Promise<void>;
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

export type BeeProv<MS = unknown> = {
  beeSend: (msg: MS) => void;
  beeExit: () => void;
  registerErrorHandlers: (onError: OnError) => void;
  registerOnMessage: (listener: (msg: any) => void) => void;
  removeOnMessage: (listener: (msg: any) => void) => void;
  importModule: (filename: string) => Promise<any>;
};

//
// messages, logs and output
//

export type SendBeeLog = (msg: BeeLogEntry) => void;

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

export type BeeLogEntry = LogEntry | StreamEntry | HtmlEntry | ErrorEntry;

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

export type BeePreloaderProv<MR extends {}, MS extends {}> = {
  useBee: (deps: BeeDeps<MR>) => Promise<Bee<MS>>;
  shutdown: () => Promise<void>;
  kill: () => Promise<void>;
  noisyKill: () => Promise<void>;
  cancel: (msg?: string) => void;
};
