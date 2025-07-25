import {
  BeeProv,
  BeeDef,
  runBee,
  BeeMain,
  ExecBeeDeps,
  BeeDeps,
  execBee,
} from "^bee-common";
import { TestProvision } from "^jarun";
import { ErrorData, LogEntry, unknownToErrorData } from "^jab";
import { sleeping } from "^yapu/yapu";

import { getScriptPath, TestMainProv } from ".";

/**
 *
 */
export const getBeeProv = (prov: TestProvision): BeeProv => {
  const beeProv: BeeProv = {
    beeSend: (msg: unknown) => {
      prov.log("message", msg);
    },
    sendLog: (log: unknown) => {
      prov.log("log", log);
    },
    beeExit: () => {
      prov.imp("exit ignored");
    },
    onError: prov.onError,
    registerErrorHandlers: () => {
      prov.imp("registerErrorHandlers ignored");
    },
    registerOnMessage: () => {
      prov.imp("registerOnMessage ignored");
    },
    removeOnMessage: () => {
      prov.imp("removeOnMessage ignored");
    },
    importModule,
    runBee: (beeDef: BeeDef) => runBee(beeProv, beeDef, false),
  };

  return beeProv;
};

/**
 *
 */
export const getBeeDeps = (
  prov: TestMainProv,
  extraDeps?: Partial<BeeDeps<any>>,
  logPrefix = "bee."
): BeeDeps<any> => ({
  def: {
    filename: getScriptPath("hello.js"),
  },
  onMessage: (msg: unknown) => {
    prov.log(logPrefix + "message", msg);
  },
  onLog: (entry) => {
    if (entry.type === "error") {
      prov.onErrorData(entry.data);
    } else {
      prov.log(logPrefix + "log", filterLogEntries(entry));
    }
  },
  onStdout: (data: Buffer | string) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },
  onStderr: (data: Buffer | string) => {
    prov.logStream(logPrefix + "stderr", data.toString());
  },
  onExit: () => {},
  onError: prov.onError,
  finally: prov.finally,
  ...extraDeps,
});

/**
 *
 */
export const makeSendLog = (prov: TestProvision) => (msg: LogEntry) => {
  prov.log("postMessage", filterLogEntries(msg));
};

/**
 *
 */
export const filterLogEntries = (entry: LogEntry) => {
  if (entry.type === "error") {
    return {
      ...entry,
      data: { ...entry.data, stack: "filtered" },
    };
  }

  return entry;
};

/**
 *
 */
export const importModule = (filename: string): Promise<{ main: BeeMain }> => {
  switch (filename) {
    case "helloModule":
      return Promise.resolve({
        main: () => {
          console.log("hello from module");
        },
      });

    case "asyncModule":
      return Promise.resolve({
        main: () =>
          sleeping(10).then(() => {
            {
              console.log("async module");
            }
          }),
      });

    case "echoModule":
      return Promise.resolve({
        main: (data) => {
          console.log("echo module: " + data.beeData);
        },
      });

    default:
      throw new Error("filename have no test module: " + filename);
  }
};

export const testExecBee = async (prov: TestProvision, deps: ExecBeeDeps) => {
  const res = await execBeeGetPrettyErrors(deps);

  res.errors.forEach((data) => {
    prov.onErrorData(data);
  });

  return { ...res, errors: [] };
};

/**
 *
 */
export const execBeeGetPrettyErrors = async <MR extends {}, MS extends {}>(
  deps: ExecBeeDeps
) => {
  const errors: ErrorData[] = [];
  const logs: LogEntry[] = [];
  const tmp = execBee<MR, MS>({
    ...deps,
    onLog: (entry) => {
      if (entry.type === "error") {
        errors.push(entry.data);
      } else {
        logs.push(entry);
      }
    },
    onError: (error) => {
      errors.push(unknownToErrorData(error));
    },
  });

  const res = await tmp.promise;

  return { ...res, logs: [...logs, ...res.logs], errors };
};
