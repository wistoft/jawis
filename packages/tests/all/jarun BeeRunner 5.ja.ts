import { TestProvision } from "^jarun";

import { BeeDeps, InMemoryBee } from "^bee-common";
import { splitStringRandomly } from "^jab";
import { getScriptPath, brRunTest } from "../_fixture";

//stdout is concatenated in the resulting test log

export default (prov: TestProvision) =>
  brRunTest(prov, getScriptPath("hello.js"), makeBee).promise;

/**
 *
 */
export const makeBee = (deps: BeeDeps<any>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      const arr = splitStringRandomly("a".repeat(100));

      for (const str of arr) {
        //this randomness should be made deterministic by BeeRunner
        bee.deps.onStdout(Buffer.from(str));
      }

      bee.terminate();
    },
  });
