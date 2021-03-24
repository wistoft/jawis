import { TestProvision } from "^jarun";

import { getInMemoryBee } from "../_fixture";

export default (prov: TestProvision) => getInMemoryBee(prov).kill();
