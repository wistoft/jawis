import { TestProvision } from "^jarun";

import { FinallyProvider } from "^jab";

// call `runFinally` twice.

export default async (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  await f.runFinally();
  await f.runFinally();
};
