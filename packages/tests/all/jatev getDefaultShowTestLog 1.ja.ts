import { TestProvision } from "^jarun";
import { getDefaultShowTestLog } from "^jatev/util";

//rogue always collaps initially.

export default (prov: TestProvision) => {
  prov.eq(
    false,
    getDefaultShowTestLog({
      type: "user",
      name: "rogue.imp",
      exp: [],
      cur: [],
    })
  );
};
