import { TestProvision } from "^jarun";

import { getJabProcessPreloaderAndDeps } from "../_fixture";

//double shutdown ignored

export default (prov: TestProvision) => {
  const [pp] = getJabProcessPreloaderAndDeps(prov);

  const prom = pp.shutdown();

  pp.shutdown(); //just ignored

  return prom;
};
