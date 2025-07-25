import { TestProvision } from "^jarun";

import { makeIncludeLine } from "^stdio-filter/internal";

//literal ignore

export default (prov: TestProvision) => {
  const include = makeIncludeLine({
    ignoreLiteralLines: ["ignore this"],
  });

  prov.chk(!include("ignore this"));
  prov.chk(include("hello"));
};
