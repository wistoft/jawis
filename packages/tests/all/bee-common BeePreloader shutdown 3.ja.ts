import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps } from "../_fixture";

//shutdown while using

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabBeePreloaderAndDeps(prov);

  const p1 = pp.useBee(deps);

  await pp.shutdown();

  const process = await p1;

  prov.chk(process.is("running")); //shutdown of preloader did not shutdown process

  return await process.shutdown();
};
