import path from "path";

import { FinallyFunc, MakeBee } from "^jab";

import {
  getFileToRequire,
  getUrlToRequire,
  MakeJabProcess,
  makeMakeTsJabProcessConditionally,
  ProcessRestarter,
} from "^jab-node";
import { BeeRunner, MakeJarunProcessRestarter } from "^jarun";

/**
 *
 */
export const makeProcessRunner = (deps: {
  makeTsProcess: MakeJabProcess;
  finally: FinallyFunc;
}) => {
  const makeTsProcessConditionally = makeMakeTsJabProcessConditionally(
    deps.makeTsProcess
  );

  return new BeeRunner({
    ...deps,
    makeBee: makeTsProcessConditionally,
  });
};

/**
 *
 */
export const makeJarunNodeProcessRestarter =
  (makeTsBee: MakeBee): MakeJarunProcessRestarter =>
  (deps) => {
    const filename = getFileToRequire(
      deps.jarunBooterDir,
      deps.jarunBooterName
    );

    return new ProcessRestarter({
      ...deps,
      def: { filename },
      makeBee: makeTsBee,
    });
  };

export type MakeJarunBrowserProcessRestarterDeps = {
  makeBrowserBee: MakeBee;
  compileServiceRoot: string;
  staticWebFolder: string;
  webRootUrl: string;
  webcsUrl: string;
};

/**
 * todo: shouldn't this implement restart?
 */
export const makeJarunBrowserProcessRestarter =
  (
    outerDeps: MakeJarunBrowserProcessRestarterDeps
  ): MakeJarunProcessRestarter =>
  (deps) => {
    //relative to what the compile service root.

    const relFile = path.relative(
      outerDeps.compileServiceRoot,
      path.join(deps.jarunBooterDir, deps.jarunBooterName)
    );

    //choose between live and development

    const filename = getUrlToRequire({
      ...outerDeps,
      liveFilepath: "/jarunBooter.js",
      devFilepath: relFile,
    });

    //done

    return outerDeps.makeBrowserBee({
      ...deps,
      def: { filename },
      onExit: deps.onUnexpectedExit,
    });
  };
