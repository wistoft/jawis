import { TestProvision } from "^jarun";

import {
  JabWorker,
  JabWorkerDeps,
  StdProcess,
  StdProcessDeps,
} from "^process-util";

/**
 *
 */
export const execForTest = (
  prov: TestProvision,
  deps: Partial<StdProcessDeps> & Pick<StdProcessDeps, "filename">
) => {
  const proc = new StdProcess(getProcessDeps(prov, deps));

  return proc.waiter.await("stopped");
};

/**
 *
 */
export const execWorkerForTest = (
  prov: TestProvision,
  deps: Partial<JabWorkerDeps<any, any>> & { filename: string }
) => {
  const proc = new JabWorker(getDeps(prov, deps));

  return proc.waiter.await("stopped");
};

/**
 *
 */
const getDeps = (
  prov: TestProvision,
  deps: Partial<JabWorkerDeps<any, any>> & { filename: string }
): JabWorkerDeps<any, any> => ({
  onMessage: (msg: any) => {
    prov.log("childMessage", msg);
  },
  onStdout: (data: any) => {
    prov.logStream("child.stdout", data.toString());
  },
  onStderr: (data: any) => {
    prov.logStream("child.stderr", data.toString());
  },
  onError: (error: any) => {
    prov.onError(error);
  },
  onExit: () => {},
  finally: prov.finally,
  ...deps,
});

/**
 *
 */
export const getProcessDeps = (
  prov: TestProvision,
  deps: Partial<StdProcessDeps> & { filename: string }
): StdProcessDeps => ({
  onStdout: (data: any) => {
    prov.logStream("child.stdout", data.toString());
  },
  onStderr: (data: any) => {
    prov.logStream("child.stderr", data.toString());
  },
  onError: (error: any) => {
    prov.onError(error);
  },
  onExit: () => {},
  onClose: () => {},
  finally: prov.finally,
  ...deps,
});
