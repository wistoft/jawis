import {
  BeeRunner,
  JarunProcessController,
  JarunProcessControllerDeps,
} from "^jarun";
import { makeNodeConfMakeBee } from "^bee-node";
import { makePhpBee } from "^bee-php";
import { HoneyComb, MakeBee } from "^bee-common";

import { ProcessRestarter } from "^process-util";
import { GetAbsoluteSourceFile } from "^jab";
import {
  makeProcessRunner,
  makeTsNodeJabProcess,
  makeCommandBee,
  makePowerBee,
  makeGoBee,
  getJarunProcessControllerForBrowser,
} from "./internal";

export type GeneralRunnerDeps = Omit<
  JarunProcessControllerDeps,
  "makeProcessRestarter"
> & {
  honeyComb: HoneyComb<"ww">;
  makeTsBee: MakeBee;
  getAbsoluteSourceFile?: GetAbsoluteSourceFile;
};

/**
 * todo: just use honeycomb to define bee runners?
 *
 */
export const makeJarunTestRunners = (deps: GeneralRunnerDeps) => {
  const jpcNode = new JarunProcessController({
    ...deps,
    makeProcessRestarter: (innerDeps) =>
      new ProcessRestarter({ ...innerDeps, makeBee: deps.makeTsBee }),
  });

  const jpcBrowser = getJarunProcessControllerForBrowser(deps);

  const pr = makeProcessRunner({
    ...deps,
    makeTsProcess: makeTsNodeJabProcess,
  });

  const wo = new BeeRunner({
    ...deps,
    makeBee: makeNodeConfMakeBee(
      deps.makeTsBee,
      {
        enableLongTraces: false,
        exitOnError: false,
      },
      deps.getAbsoluteSourceFile
    ),
  });

  const ww = new BeeRunner({
    ...deps,
    makeBee: deps.honeyComb.makeMakeCertainBee("ww"),
  });

  const cmd = new BeeRunner({
    ...deps,
    makeBee: makeCommandBee,
  });

  const ps = new BeeRunner({
    ...deps,
    makeBee: makePowerBee,
  });

  const php = new BeeRunner({
    ...deps,
    makeBee: makePhpBee,
  });

  const go = new BeeRunner({
    ...deps,
    makeBee: makeGoBee,
  });

  return {
    ".ww.ja.js": jpcBrowser,
    ".ww.ja.ts": jpcBrowser,
    ".ww.ja.jsx": jpcBrowser,
    ".ww.ja.tsx": jpcBrowser,
    ".ja.js": jpcNode,
    ".ja.ts": jpcNode,
    ".ja.jsx": jpcNode,
    ".ja.tsx": jpcNode,
    ".pr.js": pr,
    ".pr.ts": pr,
    ".wo.js": wo,
    ".wo.ts": wo,
    ".ww.js": ww,
    ".ww.ts": ww,
    ".cmd": cmd,
    ".ps1": ps,
    ".php": php,
    ".go": go,
  };
};
