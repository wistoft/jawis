import { ClonedValue, ErrorData, FinallyFunc } from ".";

export type JabShutdownMessage = {
  type: "shutdown";
};

export type BeeDeps<MR> = {
  filename: string;
  finally: FinallyFunc;
} & BeeListeners<MR>;

export type BeeListeners<MR> = {
  onMessage: (msg: MR) => void;
  onLog: (entry: JagoLogEntry) => void;
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: (exitCode: number | null) => void;
};

//support for SharedDataArray
export type WorkerBeeDeps<MR> = BeeDeps<MR> & {
  workerData?: unknown;
};

export type BeeStates = "running" | "stopping" | "stopped";
export type BeeEvents = "message";

/**
 * A bee is an abstaction over processes/workers.
 */
export type Bee<MS> = {
  send: (msg: JabShutdownMessage | MS) => Promise<void>;
  shutdown: () => Promise<void>;
  kill: () => Promise<void>;
  noisyKill: () => Promise<void>;
  is: (state: BeeStates) => boolean;
};

export type MakeBee = <MS extends {}, MR extends {}>(
  deps: BeeDeps<MR>
) => Bee<MS>;

export type MakeCertainBee = <MS extends {}, MR extends {}>(
  type: "ww",
  deps: BeeDeps<MR>
) => Bee<MS>;

/**
 * Can make scripts into worker bees.
 */
export type HoneyComb = {
  isBee: (filename: string) => boolean;
  makeBee: MakeBee;
  makeCertainBee: MakeCertainBee;
};

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
  logs: JagoLogEntry[];
  errors: unknown[];
};

//
// log provision and jago logging convention.
//

export type LogEntry = {
  type: "log";
  data: ClonedValue[];
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

export type ScriptOutput =
  | {
      type: "message";
      data: unknown;
    }
  | {
      type: "log";
      data: JagoLogEntry;
    }
  | {
      type: "stdout";
      data: string;
    }
  | {
      type: "stderr";
      data: string;
    };

//
// beeworld
//

export type JagoSend = (msg: JagoLogEntry) => void; //probably place elsewhere

export type MakeSend = <M extends {}>() => (msg: M) => void;

// compatible with PromiseRejectionEvent from lib.dom. I.e. this is a subset.
export type PromiseRejectionEvent = {
  readonly reason: unknown;
  readonly promise: Promise<unknown>;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
};

// compatible with ErrorEvent from lib.dom. I.e. this is a subset.
export type ErrorEvent = {
  readonly error: unknown;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
};
