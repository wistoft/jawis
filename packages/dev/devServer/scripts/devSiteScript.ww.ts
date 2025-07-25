import { BeeMain } from "^bee-common";
import { assert, isNode } from "^jab";

/**
 *
 */
export const main: BeeMain = (prov) => {
  assert(!isNode(), "should not run in node");

  prov.beeSend("my message");

  //this is needed, because web workers don't detect when it has no more work to do.

  setTimeout(() => {
    prov.beeExit();
  }, 500);
};
