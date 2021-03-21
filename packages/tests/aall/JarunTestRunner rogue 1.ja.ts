import { TestProvision } from "^jarun";

import { jtrRunTest } from "../_fixture";
import { sleeping, getPromise, PromiseTriple } from "^jab";

//using prov after test ends. (in promise.then)

export default (prov: TestProvision) => {
  //to be able to make the rogue action after test ends.
  let prom: PromiseTriple<void>;

  return jtrRunTest(prov, () => (inner) => {
    prom = getPromise(); //make in the test case, so jarun can detect it.

    prom.promise
      .then(() => inner.imp("rogue")) //using prov to late
      .catch(inner.onError); //needed, because uh-rejection would go into outer Jarun.
  }).then(() => {
    prom.resolve(); //start the rogue stuff

    return sleeping(10); // give time for Jarun to pick up the rudeness.
  });
};
