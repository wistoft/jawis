import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps } from "../_fixture";

//shutdown preloader after use but before shutdown process

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  const process = await pp.useProcess(deps);

  await pp.shutdown();

  prov.eq("done", pp.waiter.getState());

  prov.eq("running", process.waiter.getState()); //shutdown of preloader did not shutdown process

  return await process.shutdown();
};
