import { TestProvision } from "^jarun";

import { getJabWatchableProcess } from "../_fixture";

//run simple script

export default async (prov: TestProvision) => {
  const wp = await getJabWatchableProcess(prov, {
    onMessage: (m: any) => {
      console.log(m);
    },
  });

  await wp.waiter.await("message");

  await wp.shutdown();
};
