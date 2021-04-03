import { TestProvision } from "^jarun";
import { TS_TIMEOUT } from "^jab-node";
import {
  getBeeDeps,
  getTsProjectPath,
  makeMakeJacsBee_test,
} from "../_fixture";
import { FinallyProvider } from "^jab";

// call `runFinally` twice.

export default async (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  await f.runFinally();
  await f.runFinally();
};
