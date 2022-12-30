import {
  ClientMessage,
  TestLogMatchType,
  ZippedTestLog,
  testLogsEqual,
  UserLog,
  ErrorLog,
  ReturnLog,
  testLogOrder,
} from "^jatec";
import { dynamicDiff } from "^assorted-algorithms";
import { assertNever, ErrorData } from "^jab";
import { TestState } from "./internal";

export type ClientApiSendProv = {
  apiSend: (data: ClientMessage) => void;
};

/**
 *
 */
export const getTestLogMatchType = (
  testLog: ZippedTestLog
): TestLogMatchType => {
  switch (testLog.type) {
    case "user":
    case "err":
      return getTestLogMatchType_array(testLog);

    case "return":
      return getTestLogMatchType_value(testLog);

    case "chk":
      return "different";

    default:
      throw assertNever(testLog);
  }
};

/**
 *
 */
export const getTestLogMatchType_array = (
  testLog: UserLog | ErrorLog
): TestLogMatchType => {
  if (testLog.exp.length === 0) {
    if (testLog.cur.length === 0) {
      return "nothing";
    } else {
      return "only-current";
    }
  } else {
    if (testLog.cur.length === 0) {
      return "only-expected";
    } else if (testLogsEqual(testLog)) {
      return "match";
    } else {
      return "different";
    }
  }
};

/**
 *
 */
export const getTestLogMatchType_value = (
  testLog: ReturnLog
): TestLogMatchType => {
  if (testLog.exp === undefined) {
    if (testLog.cur === undefined) {
      return "nothing";
    } else {
      return "only-current";
    }
  } else {
    if (testLog.cur === undefined) {
      return "only-expected";
    } else if (testLogsEqual(testLog)) {
      return "match";
    } else {
      return "different";
    }
  }
};

/**
 *
 */
export const getDefaultShowTestState = (testLog: ZippedTestLog) => {
  if (testLog.name.startsWith("rogue.")) {
    return false;
  }

  return !testLogsEqual(testLog);
};

/**
 *
 */
export const errLogDiff = (left: string[], right: ErrorData[]) =>
  dynamicDiff(left, right, (l, r) => l === r.msg);

/**
 * Immutable.
 */
export const sortTestLogs = (testLogs: ZippedTestLog[]) =>
  [...testLogs].sort((a, b) => {
    let ia = testLogOrder.indexOf(a.name);
    let ib = testLogOrder.indexOf(b.name);

    if (ia === -1) {
      ia = Number.MAX_VALUE;
    }

    if (ib === -1) {
      ib = Number.MAX_VALUE;
    }

    return ia - ib;
  });

/**
 * Used in 'accept all test logs' and 'run failed tests'
 *
 * - If there's no status, there's nothing to accept.
 * - If test pass, there's no need to accept. Nothing would happen.
 *
 * note
 *  - these are computed on the client, because the server doesn't know the test selection.
 *      I.e. tests not shown, will not have their test logs accepted.
 */
export const getTestLogsThatDiffer = (
  tests: TestState[][],
  includeRogue: boolean
) =>
  tests.reduce<string[]>(
    (acc, cur) =>
      acc.concat(
        cur
          .filter(
            (test) =>
              test.status !== undefined &&
              test.status !== "." &&
              (includeRogue || !test.rogue)
          )
          .map((test) => test.id)
      ),
    []
  );
