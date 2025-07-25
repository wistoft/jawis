import { TestProvision } from "^jarun";

import { getJarunProcessController } from "../_fixture";

export default (prov: TestProvision) => getJarunProcessController(prov).kill();
