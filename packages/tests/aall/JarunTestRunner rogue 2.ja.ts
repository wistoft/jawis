import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";
import { sleeping, getPromise, PromiseTriple } from "^jab";

//reject a promise after test ends.

export default (prov: TestProvision) => {
  //to be able to make the rogue action after test ends.
  let prom: PromiseTriple<void>;

  return jtrRunTest(prov, () => (inner) => {
    //make in the test case, so jarun can detect it.
    prom = getPromise();

    prom.promise.catch(inner.onError); //needed, because uh-rejection would go into outer Jarun.
  }).then(() => {
    //after test runner has finished.
    prom.reject(new Error("after eight."));

    // give time for Jarun to pick up the rudeness.
    return sleeping(10);
  });
};
