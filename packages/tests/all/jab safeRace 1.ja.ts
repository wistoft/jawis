import { TestProvision } from "^jarun";

import { nightmare, safeRace, sleeping, sleepingValue } from "^yapu";

export const helper = (d1: number, d2: number) => (prov: TestProvision) => {
  const sleep1 = sleepingValue(d1, "sweet");
  const nightmare2 = nightmare(d2);

  return safeRace([sleep1, nightmare2], prov.onError).then((val) => {
    // log the resolved value.
    prov.imp(val);
    // wait for rejection
    return sleeping(d2 - d1 + 100);
  });
};

export default helper(100, 200);
