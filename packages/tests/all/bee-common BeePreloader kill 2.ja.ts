import { TestProvision } from "^jarun";

import { getJabBeePreloader } from "../_fixture/index";

export default (prov: TestProvision) => getJabBeePreloader(prov).kill();
