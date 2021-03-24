import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// await timeout

export default (prov: TestProvision) => getWaiter(prov).await("done");
