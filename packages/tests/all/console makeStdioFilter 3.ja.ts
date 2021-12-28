import { TestProvision } from "^jarun";

import { makeStdioFilter } from "^util-javi/node";

//ending a line, when data is buffered.

export default (prov: TestProvision) => {
  const filter = makeStdioFilter(prov.imp, () => true, 1000);

  filter("hello"); //cause the timeout to start.
  filter("igen\n"); //end the line, so the timeout, should also be cancelled.
};
