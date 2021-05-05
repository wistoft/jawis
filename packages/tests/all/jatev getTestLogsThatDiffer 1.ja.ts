import { TestProvision } from "^jarun";

import { TestState } from "^jatev";
import { getTestLogsThatDiffer } from "^jatev/util";

export default (prov: TestProvision) => {
  const tests: TestState[][] = [
    [
      { id: "test 1", status: "." },
      { id: "test 2", status: 0 },
      { id: "test 3", status: 1, rogue: true },
    ],
    [{ id: "test 21" }],
  ];

  prov.eq(["test 2"], getTestLogsThatDiffer(tests, false));

  //including rogue

  prov.eq(["test 2", "test 3"], getTestLogsThatDiffer(tests, true));
};
