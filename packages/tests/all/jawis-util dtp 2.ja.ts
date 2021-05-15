import { TestProvision } from "^jarun";

import { dtp } from "^util/dtp";

//cycle in dependencies

export default (prov: TestProvision) => {
  const tests = new Map([["1", 0]]);
  const map = new Map([["a", new Set("1")]]);

  prov.eq([["1"]], dtp([], ["1"], "", tests, map));
  prov.eq([["1"]], dtp([], ["1"], "", tests, map));
  prov.eq([[], ["1"]], dtp([], ["a"], "", tests, map));

  map.set("b", new Set(["a"]));

  prov.eq([["1"]], dtp([], ["1"], "", tests, map));
  prov.eq([[], ["1"]], dtp([], ["a"], "", tests, map));
  prov.eq([[], ["1"]], dtp([], ["a", "b"], "", tests, map));
  prov.eq([[], [], ["1"]], dtp([], ["b"], "", tests, map));

  map.set("a", new Set(["1", "b"]));

  prov.eq([["1"]], dtp([], ["1"], "", tests, map));
  prov.eq([[], ["1"]], dtp([], ["a"], "", tests, map));
  prov.eq([[], ["1"]], dtp([], ["a", "b"], "", tests, map));
  prov.eq([[], [], ["1"]], dtp([], ["b"], "", tests, map));
};
