import { TestProvision } from "^jarun";

import { getJabWatchableProcess, shutdownQuickFix } from "../_fixture";

//run simple script

export default async (prov: TestProvision) => {
  const wp = await getJabWatchableProcess(prov, {
    onMessage: (m: any) => {
      console.log(m);
    },
  });

  await wp.waiter.await("message");

  await shutdownQuickFix(wp);
};
