import { getPromise, nightmare } from "^yapu";
import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";

//one of the returned promises rejects late

export default (prov: TestProvision) => {
  const done = getPromise<void>();

  return jtrRunTest(
    prov,
    () => (inner) => {
      inner.imp("will this show?");
      return [
        Promise.resolve("hej"),
        nightmare(30, "I'm here").finally(done.resolve),
      ];
    },
    {
      timeoutms: 10,
    }
  )
    .then(prov.imp)
    .then(() => done.promise);
};
