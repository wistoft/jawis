import { TestProvision, createJarunPromise } from "^jarun";

import { jtrRunTest } from "../_fixture";

export default (prov: TestProvision) =>
  jtrRunTest(prov, () => () => {
    // eslint-disable-next-line no-global-assign
    Promise = createJarunPromise(prov as any);
  });
