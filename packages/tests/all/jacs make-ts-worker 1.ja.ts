import { TestProvision } from "^jarun";
import { getScriptPath, makeTsWorker_test } from "../_fixture";

// script, that returns by it self.

export default (prov: TestProvision) =>
  makeTsWorker_test(prov, getScriptPath("helloTs.ts")).exitPromise;
