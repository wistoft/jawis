import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";

// soft timeout and hard timeout

//signal never settles

export default (prov: TestProvision) => getWaiter(prov).await("done", 20, 1);
