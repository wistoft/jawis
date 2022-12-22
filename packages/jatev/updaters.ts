import { err } from "^jab";

import {
  RogueData,
  mergeTestLogsAndRogue,
  testLogStatus,
  zipTestLogs,
} from "^jatec";

import { sortTestLogs } from "./util";
import { TestState, State, TestStateUpdate } from ".";

/**
 *
 */
export const makeRogueUpdater =
  (rogueData: RogueData, getRandomToken: () => number) =>
  (old: State): Partial<State> => {
    //
    // unknown test, so its added to 'global' rogueness
    //

    if (rogueData.id === undefined) {
      const tmp = zipTestLogs({ user: {} }, rogueData.data);

      return {
        unknownRogue: [...(old.unknownRogue || []), ...tmp],
      };
    }

    //
    // we know the test, so we can merge with its logs.
    //

    if (!old.tests) {
      console.log("not impl: rogue data received before test list", rogueData);
      return {};
    }

    const oldTest = old.tests.getTest(rogueData.id);

    if (!oldTest.testLogs) {
      console.log(
        "not impl: rogue data received before test report",
        rogueData
      );
      return {};
    }

    const testNew = {
      id: rogueData.id,
      status: testLogStatus["rogue"],
      testLogs: mergeTestLogsAndRogue(oldTest.testLogs, rogueData.data),
      rogue: true,
    };

    return makeTestCaseUpdater(testNew, getRandomToken)(old);
  };

/**
 *
 */
export const makeTestCaseUpdater =
  (unsortedTest: TestStateUpdate, getRandomToken: () => number) =>
  (old: State): Partial<State> => {
    const testCase = {
      ...unsortedTest,
      testLogs: sortTestLogs(unsortedTest.testLogs),
    };

    //quick fix: ensure we know the test. The test result could be from an old test selection, that is in progress of stopping.
    // otherwise `getTestUpdate` will throw.
    //We can't even assert we have a test selection. Because an old test result, might arrive between a page is reloaded,
    // and the new test selection arrives.

    if (old.tests === undefined) {
      return {};
    }

    const knownTest = old.tests.flatIds.some((id) => id === testCase.id);

    if (!knownTest) {
      return {};
    }

    //do it

    const update1 = { tests: old.tests.getTestUpdate(testCase) };

    // current test

    const update2 = getShowTestOnTestChangeUpdate(
      testCase,
      old,
      getRandomToken
    );

    // done

    return { ...update1, ...update2 };
  };

/**
 * update needed to current test, when some test changes.
 */
export const getShowTestOnTestChangeUpdate = (
  test: TestStateUpdate,
  old: State,
  getRandomToken: () => number
): Partial<State> => {
  if (old.currentTest === undefined) {
    // no test case is shown, so show new test if failed.

    return test.status !== "."
      ? getUpdateToCurrentTest(test, getRandomToken)
      : {};
  } else {
    // update shown test, if that the one that changed.

    return old.currentTest.id === test.id
      ? getUpdateToCurrentTest(test, getRandomToken)
      : {};
  }
};

/**
 * Handles the freshness thing.
 */
export const getUpdateToCurrentTest = (
  test: TestState,
  getRandomToken: () => number
): Partial<State> => ({
  currentTest: test,
  currentTestFressness: getRandomToken(),
});

/**
 * Show a specific test case. (chosen by the user.)
 */
export const makeShowTestUpdater =
  (testId: string, getRandomToken: () => number) =>
  (old: State): Partial<State> => {
    if (old.tests === undefined) {
      throw err("Has no test cases.");
    }

    const test = old.tests.getTest(testId);

    return getUpdateToCurrentTest(test, getRandomToken);
  };

/**
 * Show previous test case
 */
export const onPrevUpdater =
  (getRandomToken: () => number) =>
  (old: State): Partial<State> => {
    if (old.tests === undefined || old.tests.flatIds.length === 0) {
      return { userMessage: "No tests, so can't show previous." };
    }

    return getUpdateToCurrentTest(
      old.tests.getPrevTest(old.currentTest?.id),
      getRandomToken
    );
  };

/**
 * Show previous test case
 */
export const onNextUpdater =
  (getRandomToken: () => number) =>
  (old: State): Partial<State> => {
    if (old.tests === undefined || old.tests.flatIds.length === 0) {
      return { userMessage: "No tests, so can't show next." };
    }

    return getUpdateToCurrentTest(
      old.tests.getNextTest(old.currentTest?.id),
      getRandomToken
    );
  };
