import { TestProvision } from "^jarun";

import { getServer_test_app } from "../_fixture";

// doesn't close server again. But waits for listening event.

export default (prov: TestProvision) =>
  getServer_test_app(prov).then(() => {
    // to avoid return
  });
