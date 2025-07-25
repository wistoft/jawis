import { StdProcess, StdProcessDeps } from "^process-util";

import { getJabProcessDeps, TestMainProv } from ".";

/**
 *
 */
export const getStdProcess = (
  prov: TestMainProv,
  extraDeps?: Partial<StdProcessDeps>,
  logPrefix?: string
) => new StdProcess(getJabProcessDeps(prov, extraDeps, logPrefix));
