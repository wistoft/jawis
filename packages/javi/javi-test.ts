import {
  OnRogue,
  JarunTestRunner,
  TestFrameworkProv,
  MinimalTestId,
} from "^jatec";
import { FinallyFunc, HoneyComb, LogProv, MakeBee, OnRequire } from "^jab";
import {
  ComposedTestFramework,
  JarunTestFramework,
  MakeTestFramework,
} from "^jates";

import { JestAdapter, MochaAdapter } from "^util-javi/node";
import {
  makeCommandBee,
  makeNodeConfMakeBee,
  MakeJabProcess,
  makePowerBee,
} from "^jab-node";
import { BeeRunner, JarunProcessController } from "^jarun";
import {
  MakeJarunBrowserProcessRestarterDeps,
  makeJarunNodeProcessRestarter,
  makeProcessRunner,
  TestFrameworkDefinition,
} from "^javi";

/**
 *
 */
export const makeMakeTestFramework =
  (outerDeps: {
    absTestLogFolder: string;
    testFrameworkDef: TestFrameworkDefinition;
    makeJarunTestRunners: MakeTestRunners;
  }): MakeTestFramework =>
  (deps) => {
    //quick fix to always have jarun.
    const jarun = new JarunTestFramework({
      absTestFolders: outerDeps.testFrameworkDef.absJarunTestFolders,
      subFolderIgnore: ["node_modules"], //todo extract to conf
      runners: outerDeps.makeJarunTestRunners({
        onRogueTest: deps.onRogueTest,
        onError: deps.onError,
        logProv: deps.logProv,
        finally: deps.finally,
        onRequire: deps.onRequire,
      }),
      onError: deps.onError,
    });

    const frameworks: TestFrameworkProv<MinimalTestId>[] = [];

    if (outerDeps.testFrameworkDef.jarun) {
      frameworks.push(jarun);
    }

    if (outerDeps.testFrameworkDef.absMochaTestFolder) {
      frameworks.push(
        new MochaAdapter({
          absTestFolder: outerDeps.testFrameworkDef.absMochaTestFolder,
        })
      );
    }

    if (outerDeps.testFrameworkDef.absJestTestFolder) {
      frameworks.push(
        new JestAdapter({
          absTestFolder: outerDeps.testFrameworkDef.absJestTestFolder,
        })
      );
    }

    return new ComposedTestFramework({
      onError: deps.onError,
      absTestLogFolder: outerDeps.absTestLogFolder,
      frameworks,
      jarun,
    });
  };

export type MakeTestRunners = (deps: {
  onRogueTest: OnRogue;
  onRequire: OnRequire;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
}) => { [suffix: string]: JarunTestRunner };

/**
 *
 */
export const makeMakeJarunTestRunners = (
  outerDeps: MakeJarunBrowserProcessRestarterDeps & {
    honeyComb: HoneyComb;
    makeTsBee: MakeBee;
    makeTsProcess: MakeJabProcess;
  }
): MakeTestRunners => {
  return (deps) => {
    const jpcNode = new JarunProcessController({
      ...deps,
      makeProcessRestarter: makeJarunNodeProcessRestarter(outerDeps.makeTsBee),
    });

    // const jpcBrowser = new JarunProcessController({
    //   ...deps,
    //   makeProcessRestarter: makeJarunBrowserProcessRestarter(outerDeps),
    // });
    const pr = makeProcessRunner({
      ...deps,
      makeTsProcess: outerDeps.makeTsProcess,
    });

    const wo = new BeeRunner({
      ...deps,
      makeBee: makeNodeConfMakeBee(outerDeps.makeTsBee, {}),
    });

    const ww = new BeeRunner({
      ...deps,
      makeBee: (deps) => outerDeps.honeyComb.makeCertainBee("ww", deps),
    });

    const ps = new BeeRunner({
      ...deps,
      makeBee: makePowerBee,
    });

    const cmd = new BeeRunner({
      ...deps,
      makeBee: makeCommandBee,
    });

    return {
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
      ".ps1": ps,
      ".cmd": cmd,
    };
  };
};
