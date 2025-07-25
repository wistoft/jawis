import { TestProvision } from "^jarun";
import { getScriptPath, makeTsWorker_test } from "../_fixture";

// script, that returns by it self.

export default async (prov: TestProvision) => {
  const { exitPromise } = await makeTsWorker_test(
    prov,
    getScriptPath("helloTs.ts")
  );

  return exitPromise;
};
