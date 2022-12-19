import { TestProvision } from "^jarun";

import { FinallyProvider } from "^finally-provider";

// call `runFinally` twice.

export default async (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  await f.runFinally();
  await f.runFinally();
};
