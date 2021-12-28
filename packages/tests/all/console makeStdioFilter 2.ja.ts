import { TestProvision } from "^jarun";

import { sleeping } from "^jab";
import { makeStdioFilter } from "^util-javi/node";

//new buffered data, when already buffering

export default (prov: TestProvision) => {
  const filter = makeStdioFilter(prov.imp, () => true, 10);

  filter("hello");
  filter("igen");

  return sleeping(20);
};
