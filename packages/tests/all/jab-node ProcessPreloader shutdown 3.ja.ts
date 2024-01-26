import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, shutdownQuickFix } from "../_fixture";

//shutdown while using

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  const p1 = pp.useProcess(deps);

  await pp.shutdown();

  prov.eq("starting", pp.waiter.getState()); //this is misleading

  const process = await p1;

  prov.eq("running", process.waiter.getState()); //shutdown of preloader did not shutdown process

  await shutdownQuickFix(process);
};
