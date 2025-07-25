import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { makeStdioLinearizer_old } from "^stdio-filter/internal";

//buffer, emit, buffer again.

export default (prov: TestProvision) => {
  const filter = makeStdioLinearizer_old(prov.imp, () => true, 10);

  filter("a");
  filter("b\n");
  filter("c"); //this is auto-flushed.

  return sleeping(20);
};
