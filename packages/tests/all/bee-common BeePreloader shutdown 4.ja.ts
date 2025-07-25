import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps } from "../_fixture";

//shutdown preloader after use but before shutdown process

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov);

  const process = await pp.useBee(deps);

  await pp.shutdown();

  prov.chk(process.is("running")); //shutdown of preloader did not shutdown process

  return await process.shutdown();
};
