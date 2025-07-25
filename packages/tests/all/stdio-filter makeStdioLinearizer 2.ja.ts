import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { makeStdioLinearizer_old } from "^stdio-filter/internal";

//new buffered data, when already buffering

export default (prov: TestProvision) => {
  const filter = makeStdioLinearizer_old(prov.imp, () => true, 10);

  filter("hello");
  filter("igen");

  return sleeping(20);
};
