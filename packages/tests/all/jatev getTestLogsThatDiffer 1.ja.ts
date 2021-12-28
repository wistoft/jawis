import { TestProvision } from "^jarun";

import { TestState } from "^jatev/types";
import { getTestLogsThatDiffer } from "^jatev/util";

export default (prov: TestProvision) => {
  const tests: TestState[][] = [
    [
      { id: "test 1", name: "name", file: "file", status: "." },
      { id: "test 2", name: "name", file: "file", status: 0 },
      { id: "test 3", name: "name", file: "file", status: 1, rogue: true },
    ],
    [{ id: "test 21", name: "name", file: "file" }],
  ];

  prov.eq(["test 2"], getTestLogsThatDiffer(tests, false));

  //including rogue

  prov.eq(["test 2", "test 3"], getTestLogsThatDiffer(tests, true));
};
