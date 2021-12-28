import { Waiter } from "^jab";
import { TestProvision } from "^jarun";

import { getJabWatchableProcess } from "../_fixture";

export default (prov: TestProvision) =>
  getJabWatchableProcess(prov, {
    onMessage: (m: any) => {
      console.log(m);
    },
  }).then((wp) =>
    ((wp as any).waiter as Waiter<never, "message">)
      .await("message")
      .then(() => wp.shutdown())
  );
