import { getTestStatus, ZippedTestLog, testLogStatus } from "^jatec";
import { TestProvision } from "^jarun";

export default ({ imp, eq }: TestProvision) => {
  //test logs, that match

  eq(".", getTestStatus([]));

  eq(testLogStatus["unknown"], getTestStatus([{ type:"user", name: "blabla", exp: [1], cur: [2] }])); // prettier-ignore

  imp(mockTestCases.map((elm) => getTestStatus(elm)));

  // more

  eq(testLogStatus["unknown"], getTestStatus([{ type:"user", name: "blabla", exp: [1], cur: [2] }])); // prettier-ignore
};

//
// util
//

const mockTestLogs: ZippedTestLog[] = [
  {
    type: "user",
    name: "imp",
    cur: ["current test log"],
    exp: ["expected test log"],
  },
  {
    type: "user",
    name: "dev",
    cur: [""],
    exp: ["only expected"],
  },
  {
    type: "user",
    name: "div",
    cur: ["current, but no expected"],
    exp: [""],
  },
  {
    type: "user",
    name: "errMsg",
    cur: ["they are the same"],
    exp: ["they are the same"],
  },
  {
    type: "user",
    name: "nothing",
    cur: [""],
    exp: [""],
  },
];

const mockTestCases: ZippedTestLog[][] = [
  [
    {
      type: "user",
      name: "blabla",
      cur: ["What you expect"],
      exp: ["What you expect"],
    },
  ],
  mockTestLogs,
  [
    {
      type: "user",
      name: "imp",
      cur: [""],
      exp: ["You'll get nothing"],
    },
  ],
  [],
];
