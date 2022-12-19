import { err } from "^jab";
import { TestProvision } from "^jarun";

import { nightmare, safeAll } from "^yapu";

export default (prov: TestProvision) =>
  safeAll([nightmare(0, "ups")], () => {
    err("first error doesn't appear not");
  });
