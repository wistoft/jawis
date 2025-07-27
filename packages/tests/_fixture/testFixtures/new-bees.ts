import { BeeDeps } from "^bee-common";
import { makePhpBee } from "^bee-php";

import { makeGoBee } from "^javi/makeBees";
import { getBeeDeps, getScriptPath, TestMainProv } from ".";

/**
 *
 */
export const makePhpBee_test = (
  prov: TestMainProv,
  extraDeps?: Partial<BeeDeps<any>>
) => {
  const proc = makePhpBee(
    getBeeDeps(prov, {
      def: { filename: getScriptPath("hello.php") },
      ...extraDeps,
    })
  );

  return (proc as any).proc.waiter.await("stopped");
};

/**
 *
 */
export const makeGoBee_test = (
  prov: TestMainProv,
  extraDeps?: Partial<BeeDeps<any>>
) =>
  makeGoBee(
    getBeeDeps(prov, {
      def: { filename: getScriptPath("hello.go") },
      ...extraDeps,
    })
  );
