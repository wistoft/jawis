import { TestProvision } from "^jarun";

import { safeAll } from "^yapu";

export default (prov: TestProvision) => {
  const e = new Error("hello zeros");

  return safeAll([Promise.reject(e), Promise.reject(e)], prov.onError);
};
