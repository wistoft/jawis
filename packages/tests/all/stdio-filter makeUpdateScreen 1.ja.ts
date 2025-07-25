import { TestProvision } from "^jarun";

import { makeUpdateScreen } from "^stdio-filter/internal";

export default (prov: TestProvision) => {
  const update = makeUpdateScreen({
    streamOutput: (str: string) => prov.logStream("output", str),
  });

  update(["hej"]);
  update(["dav"]);
  update(["dav", "igen"]);
  update([""]);
};
