import { TestProvision } from "^jarun";

import { FinallyProvider } from "^finally-provider";

export default (prov: TestProvision) => {
  const f = new FinallyProvider(prov);

  f.finally(() => {
    prov.imp("finally 1");
  });

  f.finally(() => {
    prov.imp("finally 2");
  });

  return f.runFinally();
};
