import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps } from "../_fixture";

//killing preloader after use but before shutdown process

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov);

  const process = await pp.useBee(deps);

  await pp.kill();

  prov.chk(process.is("running")); //kill of preloader did not shutdown process

  return await process.shutdown();
};
