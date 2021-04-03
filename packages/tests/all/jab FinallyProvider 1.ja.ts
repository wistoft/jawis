import { TestProvision } from "^jarun";

import { FinallyProvider } from "^jab";

//

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
