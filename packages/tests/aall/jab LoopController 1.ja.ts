import { TestProvision } from "^jarun";

import { littleLoop } from "../_fixture";

export default (prov: TestProvision) => littleLoop(prov).getPromise();
