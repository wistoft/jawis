import { TestProvision } from "^jarun";
import { getDefaultShowTestState } from "^jatev/util";

//rogue always collaps initially.

export default (prov: TestProvision) => {
  prov.eq(
    false,
    getDefaultShowTestState({
      type: "user",
      name: "rogue.imp",
      exp: [],
      cur: [],
    })
  );
};
