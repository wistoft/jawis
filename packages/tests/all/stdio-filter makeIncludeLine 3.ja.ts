import { TestProvision } from "^jarun";

import { makeIncludeLine } from "^stdio-filter/internal";

//json can be filtered.

export default (prov: TestProvision) => {
  const include = makeIncludeLine({
    includeJson: (obj) => obj["includeThis"] !== undefined,
  });

  prov.chk(!include("{}"));
  prov.chk(include('{"includeThis":1}'));
};
