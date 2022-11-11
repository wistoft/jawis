import { arrayCircularNext, arrayCircularPrev, assert, err } from "^jab";
import { TestState, TestStateUpdate } from ".";

export type TestCollection = {
  tests: TestState[][];
  flatIds: string[];
} & Methods;

type Methods = {
  getTestUpdate: (
    this: TestCollection,
    test: TestStateUpdate
  ) => TestCollection;
  getTest: (this: TestCollection, testId: string) => TestState;
  getPrevTest: (this: TestCollection, testId?: string) => TestState;
  getNextTest: (this: TestCollection, testId?: string) => TestState;
};

/**
 * Data structure for test cases.
 *
 * - basically manages an array of arrays. Could be generalised/extracted.
 * - all operations are immutable, so the data structure can be used in react.
 *
 * notes
 *  - Test update should perform well, because it's called for each test result.
 *      All other methods are called only by UI, so performance is less important.
 *  - To make test update constant time, re-render needs to be constant too, otherwise it's a minor improvement to make
 *      data structure update in contant time. Therefore we can accept linear time to
 *      update a test case. If it gets too slow, we can batch updates as a first approach. If that gets too slow,
 *      we can make update and re-render both into log(n), by rendering a tree of tests, rather than a list.
 *  - It's complex to implement first, last, prev and next on a 2dArray. And performance isn't important. So a
 *      flat list of test ids is contructed to make it easy. The test object is looked up afterwards.
 *      We don't have to support insert or delete, so flatIds are only calculated on construction.
 */
export const testSelectionToCollection = (
  tests: TestState[][] = []
): TestCollection => ({
  tests,
  flatIds: tests.reduce<string[]>(
    (acc, cur) => acc.concat(cur.map((test) => test.id)),
    []
  ),
  ...methods,
});

/**
 *
 */
const methods: Methods = {
  /**
   * Returns a new collection, with the test case updated.
   */
  getTestUpdate: function (this, test) {
    assert(test.status !== undefined);
    assert(test.testLogs !== undefined);

    const [i, j] = getTestIdx(this.tests, test.id);

    const tests = get2dArrayUpdate(this.tests, i, j, test);

    return {
      ...this, // to get methods and flatIds
      tests,
    };
  },

  /**
   * Get test object from a test id.
   */
  getTest: function (this, testId) {
    const [i, j] = getTestIdx(this.tests, testId);
    return this.tests[i][j];
  },

  /**
   * Get test object that is before the given test id.
   *
   * - returns last test, if testId is undefined.
   * - throws if there is no tests.
   *
   * impl
   *  expects last and first subarrays, if they exist, to be non-empty.
   */
  getPrevTest: function (this, testId) {
    if (this.flatIds.length === 0) {
      err("Impossible.");
    }

    if (testId === undefined) {
      const id = this.flatIds[this.flatIds.length - 1];
      return this.getTest(id);
    } else {
      const idx = this.flatIds.findIndex((id) => id === testId);

      const id = arrayCircularPrev(this.flatIds, idx);

      return this.getTest(id);
    }
  },

  /**
   * Get test object that is after the given test id.
   *
   * - returns first test, if testId is undefined.
   */
  getNextTest: function (this, testId?) {
    if (this.flatIds.length === 0) {
      err("Impossible.");
    }

    if (testId === undefined) {
      const id = this.flatIds[0];
      return this.getTest(id);
    } else {
      const idx = this.flatIds.findIndex((id) => id === testId);

      const id = arrayCircularNext(this.flatIds, idx);

      return this.getTest(id);
    }
  },
};

//
// util
//

/**
 * Update an array immutable.
 */
const getArrayUpdate = <T>(arr: T[], idx: number, elm: T) => {
  const res = arr.slice();
  res[idx] = elm;
  return res;
};

/**
 * Update a 2d array immutable.
 */
const get2dArrayUpdate = <T>(arr: T[][], idx: number, idx2: number, elm: T) =>
  getArrayUpdate(arr, idx, getArrayUpdate(arr[idx], idx2, elm));

/**
 * Returns the two indexes for the test id.
 *
 * - exported for testing
 */
export const getTestIdx = (
  selection: TestState[][],
  testId: string
): [number, number] => {
  let i = 0;

  for (const tests of selection) {
    const testIdx = tests.findIndex((elm) => elm.id === testId);

    if (testIdx !== -1) {
      return [i, testIdx];
    }

    i++;
  }

  throw err("Could not find testId: ", testId);
};
