import { FinallyProvider } from "^finally-provider";
import {
  captureArrayEntries,
  err,
  LogProv,
  unknownToErrorData,
  OnError,
  tryProp,
  assert,
  OnErrorData,
  getRandomInteger,
  SendLog,
  LogEntry,
  makeThrottle,
} from "^jab";

import { BeeDef, BeeMain, BeeProv, BeeProvAndData } from "./internal";

/**
 * Send errors over ipc.
 *
 */
export const makeBeeOnError = (sendLog: SendLog) => {
  const onErrorData: OnErrorData = (data) => {
    sendLog({
      type: "error",
      data,
    });
  };

  const onError: OnError = (error, extraInfo) => {
    onErrorData(unknownToErrorData(error, extraInfo));
  };

  return { onError, onErrorData };
};

/**
 * Use for tunnelling bee logs on same ipc as the script uses.
 *
 * - Also throttles the status log
 */
export const makeSendTunneledLog = (
  send: (msg: any) => void,
  channelToken: string | number
): SendLog => {
  const sendStatus = makeThrottle(
    (msg: LogEntry) =>
      send({
        beeLog: channelToken,
        ...msg,
      }),
    250
  );

  return (msg: LogEntry) => {
    assert(typeof msg === "object" && msg !== null, "Message must be an object", msg); // prettier-ignore

    if (msg.type === "status") {
      return sendStatus(msg);
    }

    return send({
      beeLog: channelToken,
      ...msg,
    });
  };
};

/**
 *
 */
export const makeBeeLogChannel = (
  onMessage: (msg: any) => void,
  send: SendLog
) => {
  const beeChannelToken = "" + getRandomInteger();

  return {
    beeChannelToken,
    onMessage: (msg: any) => {
      if (tryHandleTunneledLog(msg, send, beeChannelToken)) {
        return;
      }

      //it's a standard message.
      onMessage(msg);
    },
  };
};

/**
 * Handle a message from a sub channal
 *
 * - Send the message on, if it was a bee log.
 * - Returns true, if it was a bee log message.
 */
export const tryHandleTunneledLog = (
  msg: any,
  send: SendLog,
  channelToken: string
) => {
  if (tryProp(msg, "beeLog") === channelToken) {
    delete msg["beeLog"];
    send(msg);
    return true;
  }

  return false;
};

/**
 *
 */
export const makeMainBeeProv = (sendLog: SendLog, logPrefix = "") => {
  const { onError, onErrorData } = makeBeeOnError(sendLog);
  const finalProv = new FinallyProvider({ onError });
  const logProv = makeBeeLogProv(sendLog, logPrefix);

  return {
    onError,
    onErrorData,
    finalProv,
    finally: finalProv.finally,
    logProv,
    log: logProv.log,
    logStream: logProv.logStream,
  };
};

/**
 *
 */
export const makeBeeLogProv = (sendLog: SendLog, logPrefix = ""): LogProv => ({
  log: (...args) =>
    sendLog({
      type: "log",
      data: captureArrayEntries(args),
      logName: logPrefix,
    }),
  logStream: (type, data) =>
    sendLog({
      type: "stream",
      data: typeof data === "string" ? data : data.toString(),
      logName: logPrefix ? logPrefix + type : type,
    }),
  status: () => {
    err("makeBeeLogProv.status: not impl");
  },
});

/**
 *
 * - Protects against recursive use, by sending to original-function in that case.
 *    This avoids infinite loop, if console.log is used during execution.
 */
export const monkeyPatchConsoleFunction = (
  send: SendLog,
  logName: "error" | "warn" | "log" | "info"
) => {
  const originalFunction = console[logName];

  let inUse = false;

  console[logName] = (...entry: unknown[]) => {
    if (inUse) {
      originalFunction(...entry);
      return;
    }

    inUse = true;

    send({
      type: "log",
      logName: "console." + logName,
      data: captureArrayEntries(entry),
    });

    inUse = false;
  };
};

/**
 * Runs a bee in the current process.
 *
 *  - Run serial composition of bee definitions.
 *  - If main returns a promise, then waits for the bee to finish before continuing.
 */
export const runBee = (
  prov: BeeProv,
  beeDef: BeeDef,
  setGlobal: boolean
): Promise<unknown> => {
  //prepare provision

  const fullProv: BeeProvAndData = {
    beeData: beeDef.data,
    ...prov,
  };

  //set provision before import of module, so scripts not exporting main, can use it.

  if (!beeDef.next) {
    // allow global use, only if it's the last bee. Others must behave better.
    setGlobal && setGlobalBeeProv(fullProv);
  }

  return prov.importModule(beeDef.filename).then((mod: any) => {
    let prom = Promise.resolve();

    //call main function, if the script exports it.
    const main = tryProp(mod, "main") as BeeMain<any>;

    if (main) {
      prom = prom.then(() => main(fullProv));
    }

    //run next bee
    return prom.then(() => {
      if (beeDef.next) {
        return runBee(prov, beeDef.next, setGlobal);
      }
    });
  });
};

/**
 *
 */
export const unsetGlobalBeeProv = () => {
  (global as any)._jawis_bee_prov = undefined;
};

/**
 *
 */
export const setGlobalBeeProv = (prov: BeeProvAndData) => {
  if ((global as any)._jawis_bee_prov) {
    throw new Error("Bee provision is already set.");
  }

  (global as any)._jawis_bee_prov = prov;
};

/**
 *
 */
export const getGlobalBeeProv = <MS = unknown, D = unknown>() => {
  if (!(global as any)._jawis_bee_prov) {
    throw new Error("Bee provision has not been set.");
  }

  return (global as any)._jawis_bee_prov as BeeProvAndData<MS, D>;
};

/**
 *
 */
export const composeBeeDefs = (first: BeeDef, second: BeeDef) => {
  if (first.next) {
    throw new Error("composeBeeDefs - not impl");
  }

  return {
    ...first,
    next: second,
  };
};
