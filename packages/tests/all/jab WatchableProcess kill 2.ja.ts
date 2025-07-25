import { TestProvision } from "^jarun";

import { getJabWatchableProcess_nonIpc_changeable } from "../_fixture";

//noisy kill after script has ended.

export default async (prov: TestProvision) => {
  const { wp, waiter } = await getJabWatchableProcess_nonIpc_changeable(prov);

  await waiter.await("exit");

  await wp.noisyKill();
};
