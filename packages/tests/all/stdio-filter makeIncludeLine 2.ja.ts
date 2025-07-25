import { TestProvision } from "^jarun";

import { makeIncludeLine } from "^stdio-filter/internal";

//also ignore when only numbers differ.

export default (prov: TestProvision) => {
  const include = makeIncludeLine({
    ignoreLiteralLines: ["ignore 1 this"],
  });

  prov.chk(!include("ignore  this"));
  prov.chk(!include("ignore 1 this"));
  prov.chk(!include("ignore 2 this"));
  prov.chk(!include("ignore 22 this"));
};
