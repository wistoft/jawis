import { AbsoluteFile, ErrorData, LogEntry, OnError, SendLog } from "^jab";
import { FinallyFunc } from "^finally-provider";

export type BeeShutdownMessage = {
  type: "shutdown";
};

export type BeeDef<D = unknown> = {
  filename: AbsoluteFile;
  data?: D;
  next?: BeeDef;
};

export type BeeConf = {
  exitOnError: boolean;
  enableLongTraces: boolean;
};

export type BeeDeps<MR> = {
  def: BeeDef;
  finally: FinallyFunc;
} & BeeListeners<MR>;

export type BeeListeners<MR> = {
  onMessage: (msg: MR) => void;
  onLog: (entry: LogEntry) => void;
  onStdout: (data: Buffer | string) => void;
  onStderr: (data: Buffer | string) => void;
  onError: (error: unknown) => void;
  onExit: () => void;
};

export type BeeStates = "running" | "stopping" | "stopped";
export type BeeEvents = "message";

/**
 * A bee is an abstaction over processes/workers.
 */
export type Bee<MS> = {
  send: (msg: BeeShutdownMessage | MS) => void;
  shutdown: () => Promise<void>;
  kill: () => Promise<void>;
  noisyKill: () => Promise<void>;
  is: (state: BeeStates) => boolean;
};

/**
 *
 */
export type MakeBee = <MS extends {}, MR extends {}>(
  deps: BeeDeps<MR>
) => Bee<MS>;

export type MakeCertainBee<C extends string> = <MS extends {}, MR extends {}>(
  type: C,
  deps: BeeDeps<MR>
) => Bee<MS>;

export type BeeProv<MS = unknown> = {
  beeSend: (msg: MS) => void;
  sendLog: SendLog;
  beeExit: () => void;
  onError: OnError;
  registerErrorHandlers: (onError: OnError) => void;
  registerOnMessage: (listener: (msg: any) => void) => void;
  removeOnMessage: (listener: (msg: any) => void) => void;
  importModule: (filename: string) => Promise<any>;
  runBee: (beeDef: BeeDef, setGlobal: boolean) => Promise<unknown>;
};

export type BeeProvAndData<MS = unknown, D = unknown> = {
  beeData: D;
} & BeeProv<MS>;

export type BeeMain<MS = unknown, D = unknown> = (
  deps: BeeProvAndData<MS, D>
) => void;

/**
 * Can make scripts into worker bees.
 */
export type HoneyComb<C extends string = string> = {
  isBee: (filename: string) => boolean;
  makeBee: MakeBee;
  makeCertainBee: MakeCertainBee<C>;
  makeMakeCertainBee: (type: C) => MakeBee;
};

//
// messages, logs and output
//

export type MakeSend = <M extends {}>() => (msg: M) => void;

export type BeeOutput =
  | {
      type: "message";
      data: unknown;
    }
  | {
      type: "log";
      data: LogEntry;
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
// from elsewhere
//

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

//
// additionally
//

export type ExecBeeDeps = {
  def: BeeDef;
  makeBee: MakeBee;
  finallyFunc: FinallyFunc;
  onError?: OnError;
  onLog?: (data: LogEntry) => void;
  onStdout?: (data: Buffer | string) => void;
  onExit?: (status?: number | null) => void;
};

export type ExecBee = <MR extends {}, MS extends {}>(
  deps: ExecBeeDeps
) => { bee: Bee<MS>; promise: Promise<BeeResult<MR>> };

export type BeeResult<MR> = {
  messages: MR[];
  logs: LogEntry[];
};

export type BeePreloaderProv<MR extends {}, MS extends {}> = {
  useBee: (deps: BeeDeps<MR>) => Promise<Bee<MS>>;
  shutdown: () => Promise<void>;
  kill: () => Promise<void>;
  noisyKill: () => Promise<void>;
};

export type ExternalLogSource = {
  getBufferedLogEntries: () => LogEntry[];
};

//
// bee frost
//

export type BeeFrostClientMessage =
  | {
      type: "message";
      bid: number;
      data: unknown;
    }
  | {
      type: "log";
      bid: number;
      data: LogEntry;
    }
  | {
      type: "exit";
      bid: number;
      data: number | null;
    }
  | {
      type: "error"; // an error, that can't be attributed to a bee.
      data: ErrorData;
    };

export type BeeFrostServerMessage =
  | {
      type: "setConf"; //must be sent as the first message
      ymerUrl: string;
      webCsUrl: string;
    }
  | {
      type: "makeBee";
      bid: number;
      filename: AbsoluteFile;
    }
  | {
      type: "message";
      bid: number;
      data: {};
    }
  | {
      type: "shutdown";
      bid: number;
    }
  | {
      type: "kill";
      bid: number;
    };
