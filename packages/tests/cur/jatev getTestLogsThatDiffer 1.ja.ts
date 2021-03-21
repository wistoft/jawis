import { getClientTestReport } from "^jatec";
import { TestProvision } from "^jarun";

import { getSetTestCaseUpdate_with_tests } from "../_fixture";
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

  prov.eq(["test 2"], getTestLogsThatDiffer(tests));
};
