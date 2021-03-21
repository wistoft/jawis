import { testSelectionToCollection } from "^jatev/TestCollection";
import { State } from "^jatev/types";
import { getUpdateToCurrentTest } from "^jatev/updaters";

export const defaultState: State = {
  isRunning: false,
  userMessage: "",
};

export const stateWithZeroTests: State = {
  ...defaultState,
  tests: testSelectionToCollection([]),
};

export const stateWithTests: State = {
  ...defaultState,
  tests: testSelectionToCollection([[{ id: "test 1" }, { id: "test 2" }]]),
};

export const stateWithShownTest: State = {
  ...defaultState,
  tests: testSelectionToCollection([[{ id: "test 1" }, { id: "test 2" }]]),
  ...getUpdateToCurrentTest({ id: "test 1" }, () => 1),
};

export const stateWithTestReports: State = {
  ...defaultState,
  tests: testSelectionToCollection([
    [
      { id: "test 1", status: ".", testLogs: [] },
      {
        id: "test 2",
        status: 1,
        testLogs: [{ type: "err", name: "err", exp: ["some error"], cur: [] }],
      },
    ],
  ]),
};
