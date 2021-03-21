import { TestProvision } from "^jarun";

import { getInMemoryBee } from "../_fixture";

export default (prov: TestProvision) => {
  const bee = getInMemoryBee(prov);

  return bee.send({}).finally(bee.shutdown);
};
