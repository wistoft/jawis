import { TestProvision } from "^jarun";

import { makeStdioLinearizer_old } from "^stdio-filter/internal";

//ending a line, when data is buffered.

export default (prov: TestProvision) => {
  const filter = makeStdioLinearizer_old(prov.imp, () => true, 1000);

  filter("hello"); //cause the timeout to start.
  filter("igen\n"); //end the line, so the timeout, should also be cancelled.
};
