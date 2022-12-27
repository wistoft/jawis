import { CreateTestRunners } from "^jates";

import { BeeRunner, JarunProcessController } from "^jarun";
import { makeProcessRunner, makeTsNodeJabProcess } from "./util";

/**
 *
 */
export const getDefaultRunnersAssignments = (
  jpc: JarunProcessController,
  pr: BeeRunner,
  wo: BeeRunner
) => ({
  ".ja.js": jpc,
  ".ja.ts": jpc,
  ".ja.jsx": jpc,
  ".ja.tsx": jpc,
  ".pr.js": pr,
  ".pr.ts": pr,
  ".wo.js": wo,
  ".wo.ts": wo,
});

/**
 *
 */
export const makeJarunTestRunners: CreateTestRunners = (deps) => {
  const jpc = new JarunProcessController(deps);

  const pr = makeProcessRunner({
    ...deps,
    makeTsProcess: makeTsNodeJabProcess,
  });

  const wo = new BeeRunner({
    ...deps,
    makeBee: deps.makeTsBee,
  });

  return getDefaultRunnersAssignments(jpc, pr, wo);
};
