import { ProcessRestarter } from "^process-util";
import { JarunProcessController, JarunProcessControllerDeps } from "^jarun";
import { getAbsoluteSourceFile_live } from "^jab-node";
import { getBeePreloaderMainDeclaration, HoneyComb } from "^bee-common";

/**
 * Hacky way to avoid doing it right.
 *  - either it should be a NoopRestarter, because webpack handles loading.
 *  - or it should use a compiler, that supports lazy loading.
 */
export const getJarunProcessControllerForBrowser = (
  deps: Omit<JarunProcessControllerDeps, "makeProcessRestarter"> & {
    honeyComb: HoneyComb<"ww">;
  }
) => {
  const getAbsoluteSourceFile = deps.getAbsoluteSourceFile ?? getAbsoluteSourceFile_live; // prettier-ignore

  //quick fix
  // - removes the main from WatchableProcessPreloader because we can't intercept require in the browser
  // - it's not a semantic problem, because webpack watches for changes, so code is kept up-to-date.

  const customBooter = getAbsoluteSourceFile(getBeePreloaderMainDeclaration());

  return new JarunProcessController({
    ...deps,
    makeProcessRestarter: (innerDeps) =>
      new ProcessRestarter({
        ...innerDeps,
        makeBee: deps.honeyComb.makeMakeCertainBee("ww"),
        customBooter,
      }),
  });
};
