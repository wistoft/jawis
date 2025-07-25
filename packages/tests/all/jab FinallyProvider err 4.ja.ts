import { TestProvision } from "^jarun";

import { FinallyProvider } from "^finally-provider";

// never resolves

export default async (prov: TestProvision) => {
  const f = new FinallyProvider({ ...prov, timeout: 20 });

  f.finally(() => new Promise(() => {}));

  await f.runFinally();
};
