import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";
import { setGlobalHardTimeout_experimental } from "^state-waiter";

// wrong timeout

export default async (prov: TestProvision) => {
  setGlobalHardTimeout_experimental(true as any);
};
