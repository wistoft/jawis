import { TestProvision, makeJarunPromise } from "^jarun";

import { jtrRunTest } from "../_fixture";

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    // eslint-disable-next-line no-global-assign
    Promise = makeJarunPromise(prov as any);
  });
