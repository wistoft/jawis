import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps, shutdownQuickFix } from "../_fixture";

//killing preloader after use but before shutdown process

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  const process = await pp.useProcess(deps);

  await pp.kill();

  prov.eq("done", pp.waiter.getState());
  prov.eq("running", process.waiter.getState()); //kill of preloader did not shutdown process

  await shutdownQuickFix(process);
};
