import { TestProvision } from "^jarun";

import { getWaiter } from "../_fixture";
import { setGlobalHardTimeout_experimental } from "^state-waiter";

// custom global default timeout is applied at each Waiter construct

export default async (prov: TestProvision) => {
  prov.finally(() => setGlobalHardTimeout_experimental(300)); //clean up after test

  setGlobalHardTimeout_experimental(5);

  //error message will show the timeout used by Waiter

  await getWaiter(prov, { hardTimeout: undefined })
    .await("done")
    .catch(prov.onError);

  setGlobalHardTimeout_experimental(10);

  //error message will show the timeout used by Waiter

  await getWaiter(prov, { hardTimeout: undefined }).await("done");
};
