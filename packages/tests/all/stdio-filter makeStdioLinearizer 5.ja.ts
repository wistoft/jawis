import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { makeStdioLinearizer_old } from "^stdio-filter/internal";

//can handle new input in buffering state.

export default (prov: TestProvision) => {
  const filter = makeStdioLinearizer_old(
    (out) => {
      prov.imp(out);
      if (out === "hello") {
        //new input, that also will be buffered, while filter has state.
        filter("hej");
      }
    },
    () => true,
    0
  );

  filter("hello"); //cause the timeout to start.

  return sleeping(10);
};
