import { TestProvision } from "^jarun";

import { makeIncludeLine } from "^stdio-filter/internal";

//prefixes are removed before ignore is evaluated

export default (prov: TestProvision) => {
  const include = makeIncludeLine({
    ignoreLiteralPrefixes: [">"],
    ignoreLiteralLines: ["fido"],
    includeLine: (line) => line !== "ignore",
    includeJson: () => false,
  });

  prov.chk(!include("fido"));
  prov.chk(!include(">fido"));
  prov.chk(include(">>fido")); //prefix is only removed once.

  prov.chk(!include("ignore"));
  prov.chk(!include(">ignore"));

  prov.chk(!include("{}"));
  prov.chk(!include(">{}"));
};
