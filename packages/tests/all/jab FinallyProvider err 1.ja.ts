import { TestProvision } from "^jarun";

import { FinallyProvider } from "^jab";

// adding finally function after `runFinally`

export default async (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  await f.runFinally();

  f.finally(() => {});
};
