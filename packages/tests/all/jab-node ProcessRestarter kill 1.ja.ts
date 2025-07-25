import { TestProvision } from "^jarun";

import { getProcessRestarter } from "../_fixture";

//kill while initial state

export default (prov: TestProvision) => getProcessRestarter(prov).kill();
