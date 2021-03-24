import { TestProvision } from "^jarun";

import { emptyLoop } from "../_fixture";

//no values

export default (prov: TestProvision) => emptyLoop(prov).getPromise();
