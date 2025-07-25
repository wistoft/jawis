import { TestProvision } from "^jarun";

import { getJabBeePreloaderAndDeps } from "../_fixture";

//double shutdown ignored

export default (prov: TestProvision) => {
  const [pp] = getJabBeePreloaderAndDeps(prov);

  const prom = pp.shutdown();

  pp.shutdown(); //just ignored

  return prom;
};
