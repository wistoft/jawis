import { TestProvision } from "^jarun";

import { FinallyProvider } from "^finally-provider";

// final function throws

export default async (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  f.finally(() => {
    throw new Error("ups");
  });

  await f.runFinally();
};
