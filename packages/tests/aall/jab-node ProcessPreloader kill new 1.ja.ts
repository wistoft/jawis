import { TestProvision } from "^jarun";

import { getJabProcessPreloader_new } from "../_fixture";

export default (prov: TestProvision) => getJabProcessPreloader_new(prov).kill();
