import { err } from "^jab";

import {
  RogueData,
  mergeTestLogsAndRogue,
  testLogStatus,
  zipTestLogs,
  sortTestLogs,
  TestState,
  State,
  TestStateUpdate,
} from "./internal";

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
  (unsortedTestUpdate: TestStateUpdate, getRandomToken: () => number) =>
  (old: State): Partial<State> => {
    //We can't even assert we have a test selection. Because an old test result, might arrive between a page is reloaded,
    // and the new test selection arrives.

    if (old.tests === undefined) {
      return {};
    }

    //Ignore udpate, if we don't know the test. The test result could be from an old test selection,
    // that is in progress of stopping. Otherwise `getTestUpdate` will throw.

    const knownTest = old.tests.tryGetTest(unsortedTestUpdate.id);

    if (!knownTest) {
      return {};
    }

    //do it

    const testCase = {
      ...unsortedTestUpdate,
      name: knownTest.name,
      file: knownTest.file,
      line: knownTest.line,
      testLogs: sortTestLogs(unsortedTestUpdate.testLogs),
    };

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
  test: TestState,
  old: State,
  getRandomToken: () => number
): Partial<State> => {
  if (old.currentTest === undefined) {
    // no test case is shown, so show new test if failed.

    return test.status !== "."
      ? getCurrentTestUpdate(test, getRandomToken)
      : {};
  } else {
    // update shown test, if that the one that changed.

    return old.currentTest.id === test.id
      ? getCurrentTestUpdate(test, getRandomToken)
      : {};
  }
};

/**
 * Handles the freshness thing.
 */
export const getCurrentTestUpdate = (
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

    return getCurrentTestUpdate(test, getRandomToken);
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

    return getCurrentTestUpdate(
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

    return getCurrentTestUpdate(
      old.tests.getNextTest(old.currentTest?.id),
      getRandomToken
    );
  };
