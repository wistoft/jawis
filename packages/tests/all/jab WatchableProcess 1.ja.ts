import { TestProvision } from "^jarun";

import { getJabWatchableProcess } from "../_fixture";

export default (prov: TestProvision) =>
  getJabWatchableProcess(prov, {
    onMessage: (m: any) => {
      console.log(m);
    },
  }).then((wp) => wp.waiter.await("message").then(() => wp.shutdown()));
