import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// hard timeout (no soft timeout)

//signal never settles

export default (prov: TestProvision) => getWaiter(prov).await("done", 1);
