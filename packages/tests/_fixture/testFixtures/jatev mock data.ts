import {
  TestCollection,
  testSelectionToCollection,
  State,
  TestState,
  getCurrentTestUpdate,
  ClientTestInfo,
} from "^jatev/internal";

import { makeTestInfo } from ".";

export const testSelectionToCollection_for_tests = (
  tests: (string | Partial<TestState>)[][] = []
): TestCollection => {
  const quickFix = tests.map((list) =>
    list.map<ClientTestInfo>((unk) => {
      if (typeof unk === "string") {
        return {
          id: unk,
          name: unk,
          file: unk,
        };
      } else {
        return {
          id: unk.id || "id",
          name: unk.name || "name",
          file: unk.file || "file",
          ...unk,
        };
      }
    })
  );

  return testSelectionToCollection(quickFix);
};

export const defaultJatevState: State = {
  isRunning: false,
  userMessage: "",
};

export const getStateWithZeroTests = (): State => ({
  ...defaultJatevState,
  tests: testSelectionToCollection([]),
});

export const getStateWithTests = (): State => ({
  ...defaultJatevState,
  tests: testSelectionToCollection_for_tests([["test 1", "test 2"]]),
});

export const getStateWithShownTest = (): State => ({
  ...defaultJatevState,
  tests: testSelectionToCollection_for_tests([["test 1", "test 2"]]),
  ...getCurrentTestUpdate(makeTestInfo("test 1"), () => 1),
});

export const getStateWithTestReports = (): State => ({
  ...defaultJatevState,
  tests: testSelectionToCollection_for_tests([
    [
      { id: "test 1", status: ".", testLogs: [] },
      {
        id: "test 2",
        status: 1,
        testLogs: [{ type: "err", name: "err", exp: ["some error"], cur: [] }],
      },
    ],
  ]),
});
