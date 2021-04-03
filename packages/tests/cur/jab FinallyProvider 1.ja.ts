import { TestProvision } from "^jarun";
import { TS_TIMEOUT } from "^jab-node";
import {
  getBeeDeps,
  getTsProjectPath,
  makeMakeJacsBee_test,
} from "../_fixture";
import { FinallyProvider } from "^jab";

//

export default (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  f.finally(() => {
    prov.imp("finally 1");
  });

  f.finally(() => {
    prov.imp("finally 2");
  });

  return f.runFinally();
};
