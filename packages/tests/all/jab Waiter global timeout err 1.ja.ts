import { TestProvision } from "^jarun";

import { setGlobalHardTimeout_experimental } from "^state-waiter";

// wrong timeout

export default async (prov: TestProvision) => {
  setGlobalHardTimeout_experimental(true as any);
};
