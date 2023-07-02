// eslint-disable-next-line import/no-extraneous-dependencies
import { makeMakeJacsWorkerBee } from "@jawis/jacs";
// eslint-disable-next-line import/no-extraneous-dependencies
import { TestProvision } from "@jawis/jarun";
// eslint-disable-next-line import/no-extraneous-dependencies
import { mainProvToConsole } from "@jawis/jab-node";

//compile service

let makeJacsWorkerCached: any;

/**
 * Compile service for test cases.
 *
 *  - Take no conf or provision, because it's cached across test cases.
 *
 */
export const getLiveMakeJacsWorker = (): any => {
  if (!makeJacsWorkerCached) {
    const mainProv = mainProvToConsole("jacs.");

    makeJacsWorkerCached = makeMakeJacsWorkerBee({
      ...mainProv,
      // experimentalCacheNodeResolve: true, //todo
      // experimentalLazyRequire: true, //todo
    }) as any;
  }

  return makeJacsWorkerCached;
};

/**
 *
 */
export const runLiveJacsBee = (
  prov: TestProvision,
  filename: string,
  data?: unknown,
  extraDeps?: any
) => {
  const makeBee = getLiveMakeJacsWorker();

  const bee = makeBee(
    getBeeDeps(prov, {
      filename: filename,
      ...extraDeps,
    })
  );

  return (bee as any).waiter.await("stopped", 10000);
};

// duplicated to avoid loading anything from fixture
const getBeeDeps = (
  prov: any /* TestMainProv */,
  extraDeps?: any,
  logPrefix = "bee."
) => ({
  filename: "dummy",
  onMessage: (msg: unknown) => {
    prov.log(logPrefix + "message", msg);
  },
  onStdout: (data: Buffer) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },
  onStderr: (data: Buffer) => {
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
export const filterStackTrace = (data: any) => {
  if (data.stack.type !== "parsed") {
    throw new Error("only jacs supported.");
  }

  return data.stack.stack
    .filter((elm: any) => {
      return (
        elm.file?.includes("\\tests\\") ||
        elm.file?.includes("/tests/") ||
        elm.file === "-----"
      );
    })
    .map((elm: any) => {
      if (elm.file === "-----") {
        if (elm.func) {
          return `----- ${elm.func}`;
        } else {
          return "-----";
        }
      } else {
        return elm.func;
      }
    });
};
