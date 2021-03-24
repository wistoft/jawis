import { TestProvision } from "^jarun";

import { err, nightmare, safeAll } from "^jab";

export default (prov: TestProvision) =>
  safeAll([nightmare(0, "ups")], () => {
    err("first error doesn't appear not");
  });
