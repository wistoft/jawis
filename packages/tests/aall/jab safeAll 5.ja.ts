import { TestProvision } from "^jarun";

import { safeAll } from "^jab";

export default (prov: TestProvision) => {
  const e = new Error("hello zeros");

  return safeAll([Promise.reject(e), Promise.reject(e)], prov.onError);
};
