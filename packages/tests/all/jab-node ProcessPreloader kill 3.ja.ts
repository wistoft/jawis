import { TestProvision } from "^jarun";

import { assertUnsettled } from "^yapu";
import { getJabProcessPreloaderAndDeps } from "../_fixture";

//kill while using

export default async (prov: TestProvision) => {
  const [pp, deps] = getJabProcessPreloaderAndDeps(prov);

  assertUnsettled(pp.useProcess(deps), prov.onError);

  await pp.kill();

  prov.eq("done", pp.waiter.getState());
};
