import { TestProvision } from "^jarun";

import { dtp } from "^util/dtp";

export default (prov: TestProvision) => {
  const tests = new Map([["1", 0]]);

  prov.eq([], dtp([], [], "", tests, new Map()));
  prov.eq([["1"]], dtp([], ["1"], "", tests, new Map()));

  const map = new Map([["a", new Set("1")]]);

  prov.eq([["1"]], dtp([], ["1"], "", tests, map));
  prov.eq([[], ["1"]], dtp([], ["a"], "", tests, map));

  prov.eq([["1"]], dtp([], ["1", "a"], "", tests, map));
};
