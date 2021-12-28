import { TestProvision } from "^jarun";

import { makeStdioFilter } from "^util-javi/node";
import { sleeping } from "^jab";

//can handle new input is buffering state.

export default (prov: TestProvision) => {
  const filter = makeStdioFilter(
    (out) => {
      prov.imp(out);
      if (out === "hello\n") {
        //new input, that also will be buffered, while filter has state.
        filter("hej");
      }
    },
    () => true,
    10
  );

  filter("hello"); //cause the timeout to start.

  return sleeping(100);
};
