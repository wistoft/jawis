import { TestProvision } from "^jarun";

import { makeStdioFilter } from "^util-javi/node";
import { sleeping } from "^jab";

//buffer, emit, buffer again.

export default (prov: TestProvision) => {
  const filter = makeStdioFilter(prov.imp, () => true, 10);

  filter("a");
  filter("b\n");
  filter("c"); //this is auto-flushed.

  return sleeping(20);
};
