import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, shutdownQuickFix } from "../_fixture";

//simple use of process

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov, {});

  const process = await pp.useProcess(deps);

  return shutdownQuickFix(process);
};
