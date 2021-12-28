import { TestInfo } from "^jatec";
import {
  TestCollection,
  testSelectionToCollection,
} from "^jatev/TestCollection";
import { State, TestState } from "^jatev/types";
import { getUpdateToCurrentTest } from "^jatev/updaters";
import { makeTestInfo } from ".";

export const testSelectionToCollection_for_tests = (
  tests: (string | Partial<TestState>)[][] = []
): TestCollection => {
  const quickFix = tests.map((list) =>
    list.map<TestInfo>((unk) => {
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

export const defaultState: State = {
  isRunning: false,
  userMessage: "",
};

export const getStateWithZeroTests = (): State => ({
  ...defaultState,
  tests: testSelectionToCollection([]),
});

export const getStateWithTests = (): State => ({
  ...defaultState,
  tests: testSelectionToCollection_for_tests([["test 1", "test 2"]]),
});

export const getStateWithShownTest = (): State => ({
  ...defaultState,
  tests: testSelectionToCollection_for_tests([["test 1", "test 2"]]),
  ...getUpdateToCurrentTest(makeTestInfo("test 1"), () => 1),
});

export const getStateWithTestReports = (): State => ({
  ...defaultState,
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
