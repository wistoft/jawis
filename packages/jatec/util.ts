import deepEqual from "deep-equal";

import {
  assertNever,
  captureArrayEntries,
  CapturedValue,
  def,
  err,
  ErrorData,
  unknownToErrorData,
  LogEntry,
} from "^jab";
import {
  UserTestLogs,
  TestResult,
  TestStatus,
  ZippedTestLog,
  ErrorLog,
  ChkInfo,
  TestCurLogs,
  TestExpLogs,
} from "./internal";

const testCurLogSystemKeys = ["err", "return", "chk", "user"];

export const testLogOrder = [
  "chk",
  "err",
  "stderr",
  "console.error",
  "child.stderr",
  "stdout",
  "console.log",
  "child.stdout",
  "imp",
];

export const testLogStatus: {
  [_: string]: number;
} = {
  rogue: 0,
  chk: 1,
  err: 2,
  stderr: 2,
  "console.error": 2,
  "child.stderr": 2,
  stdout: 3,
  "console.log": 3,
  "child.stdout": 3,
  imp: 4,
  return: 5,
  unknown: 6,
};

/**
 *
 */
export const errorToTestResult = (
  error: unknown,
  extraInfo: Array<unknown> = [],
  extraErrorMsg?: string
): TestResult => ({ cur: errorToTestLog(error, extraInfo, extraErrorMsg) });

/**
 * - Extra error message is shown first.
 *
 * todo: implement with: addErrorToTestLog
 */
export const errorToTestLog = (
  error: unknown,
  extraInfo: Array<unknown> = [],
  extraErrorMsg?: string
): TestCurLogs => {
  const data = unknownToErrorData(error, extraInfo);

  if (extraErrorMsg === undefined) {
    return { err: [data], user: {} };
  } else {
    return {
      err: [
        {
          msg: extraErrorMsg,
          info: [],
          stack: { type: "node", stack: "dummy" },
        },
        data,
      ],
      user: {},
    };
  }
};

/**
 *
 */
export const addErrorToTestResult = (
  result: TestResult,
  error: unknown,
  extraInfo: Array<unknown> = [],
  extraErrorMsg?: string
): TestResult => ({
  ...result,
  cur: addErrorToTestLog(result.cur, error, extraInfo, extraErrorMsg),
});

/**
 *
 */
export const addErrorToTestLog = (
  testLog: TestCurLogs,
  error: unknown,
  extraInfo: Array<unknown> = [],
  extraErrorMsg?: string
): TestCurLogs => {
  const newErrorLog = [...(testLog.err || [])];

  newErrorLog.push(unknownToErrorData(error, extraInfo));

  if (extraErrorMsg !== undefined) {
    newErrorLog.push({
      msg: extraErrorMsg,
      info: [],
      stack: { type: "node", stack: "dummy" },
    });
  }

  return {
    ...testLog,
    err: newErrorLog,
  };
};

/**
 * - testReturn must be cloned, already.
 */
export const errMsgAndReturnToTestLog = (
  msg: string,
  testReturn?: CapturedValue
): TestCurLogs =>
  addReturnToTestLogs(
    {
      err: [{ msg, info: [], stack: { type: "node", stack: "dummy" } }],
      user: {},
    },
    testReturn
  );

/**
 * for the return result of the test case.
 *
 * - testReturn must be already cloned.
 * - prefix can be used to make it a rogue log.
 */
export const addReturnToTestLogs = (
  logs: TestCurLogs,
  testReturn?: CapturedValue
): TestCurLogs => {
  if (testReturn !== undefined) {
    return { ...logs, return: testReturn };
  } else {
    return logs;
  }
};

/**
 *
 */
export const addErrMsgToTestLog = (
  testLog: TestCurLogs,
  msg: string,
  info: Array<unknown> = []
): TestCurLogs => ({
  ...testLog,
  err: [
    ...(testLog.err || []),
    {
      msg,
      info: captureArrayEntries(info),
      stack: { type: "node", stack: "dummy" },
    },
  ],
});

/**
 *
 */
export const testLogsEqual = (testLog: ZippedTestLog) => {
  switch (testLog.type) {
    case "err":
      return testErrorLogsEqual(testLog);

    case "return":
    case "user":
      return deepEqual(testLog.exp, testLog.cur, { strict: true });

    case "chk":
      //this is false, by 'definition'.
      return false;

    default:
      return assertNever(testLog);
  }
};

/**
 *
 */
export const testErrorLogsEqual = (testLog: ErrorLog) => {
  if (testLog.exp.length !== testLog.cur.length) {
    return false;
  }

  for (let i = 0; i < testLog.exp.length; i++) {
    if (testLog.exp[i] !== testLog.cur[i].msg) {
      return false;
    }
  }

  return true;
};

/**
 *
 */
export const getTestStatus = (testLogs: ZippedTestLog[]): TestStatus => {
  let statusNo = Number.MAX_VALUE;

  testLogs.forEach((log) => {
    if (!testLogsEqual(log)) {
      const val =
        testLogStatus[log.name] === undefined
          ? testLogStatus["unknown"]
          : testLogStatus[log.name];

      statusNo = Math.min(statusNo, val, 9);
    }
  });

  return statusNo === Number.MAX_VALUE ? "." : statusNo;
};

/**
 *
 */
export const zipTestLogs = (exp: TestExpLogs, cur: TestCurLogs) => {
  //
  // assert root level (non-user) logs are known system logs.
  //

  Object.keys(exp).forEach((key) => {
    if (!testCurLogSystemKeys.includes(key)) {
      err("unknown key in exp log: ", key, exp);
    }
  });

  Object.keys(cur).forEach((key) => {
    if (!testCurLogSystemKeys.includes(key)) {
      err("unknown key in cur log: ", key, cur);
    }
  });

  //
  // user logs
  //

  const testLogs: ZippedTestLog[] = zipObjects(exp.user, cur.user);

  //
  // system logs
  //

  if (exp.err || cur.err) {
    testLogs.push({
      type: "err",
      name: "err",
      exp: exp.err || [],
      cur: cur.err || [],
    });
  }

  if (exp.return || cur.return) {
    testLogs.push({
      type: "return",
      name: "return",
      exp: exp.return,
      cur: cur.return,
    });
  }

  if (cur.chk) {
    testLogs.push({
      type: "chk",
      name: "chk",
      ...cur.chk,
    });
  }

  return testLogs;
};

/**
 *
 */
export const zipObjects = <T, U>(
  exp: { [_: string]: T[] | undefined },
  cur: { [_: string]: U[] | undefined }
) => {
  const res: {
    type: "user";
    name: string;
    exp: T[];
    cur: U[];
  }[] = [];

  Object.keys(exp).forEach((name) => {
    if (exp[name] === undefined) {
      return;
    }

    res.push({
      type: "user",
      name,
      exp: def(exp[name]), //typescript can't see we check for undefined above.
      cur: cur[name] || [],
    });
  });

  Object.keys(cur).forEach((name) => {
    if (cur[name] === undefined) {
      return;
    }

    if (!(name in exp)) {
      res.push({
        type: "user",
        name,
        exp: [],
        cur: def(cur[name]), //typescript can't see we check for undefined above.
      });
    }
  });

  return res;
};

/**
 * - doesn't sort test logs. The client must do that itself.
 */
export const getTestData = (exp: TestExpLogs, cur: TestCurLogs) => {
  const testLogs = zipTestLogs(exp, cur);

  const status = getTestStatus(testLogs);

  return { testLogs, status };
};

/**
 *
 */
export const getJatesTestReport = (
  id: string,
  exp: TestExpLogs,
  result: TestResult
) => {
  const data = getTestData(exp, result.cur);

  return {
    id,
    status: data.status,
    zippedTestLogs: data.testLogs,
    result: result,
  };
};

/**
 *
 */
export const getClientTestReport = (
  id: string,
  exp: TestExpLogs,
  cur: TestCurLogs
) => {
  const data = getTestData(exp, cur);

  return {
    id,
    testLogs: data.testLogs,
    status: data.status,
  };
};

/**
 * note
 * - very cumbersome.
 * - actually no need to handle chk log, because Jarun never sends that.
 */
export const mergeTestLogsAndRogue = (
  curZipped: ZippedTestLog[],
  tmp: TestCurLogs
) => {
  const rogue = testLogsToFlat(tmp);

  const ordinaryCopy = { ...rogue }; //for ordinary logs
  const rogueCopy = { ...rogue }; //for the extra rogue logs

  //
  // add to existing logs
  //

  const newZipped = curZipped.map((elm): ZippedTestLog => {
    //ordinary entry

    if (elm.name in ordinaryCopy) {
      delete ordinaryCopy[elm.name];

      return mergeTestLogsAndRogue_map_testlog(rogue, elm, elm.name);
    }

    //entry previously stored with rogue

    const logName = elm.name.replace(/rogue\./, "");

    if (logName in rogueCopy) {
      delete rogueCopy[logName];

      return mergeTestLogsAndRogue_map_testlog(rogue, elm, logName);
    }

    //nothing to do

    return elm;
  });

  // create new ordinary entries.

  mergeTestLogsAndRogue_helper_by_ref(ordinaryCopy, newZipped);

  // create new rogue entries.

  mergeTestLogsAndRogue_helper_by_ref(rogueCopy, newZipped, "rogue.");

  // done

  return newZipped;
};

/**
 *
 */
export const mergeTestLogsAndRogue_map_testlog = (
  flatRogue: UserTestLogs,
  elm: ZippedTestLog,
  logName: string
): ZippedTestLog => {
  if (elm.type === "err") {
    return {
      ...elm,
      cur: elm.cur.concat(flatRogue[logName] as unknown as ErrorData[]),
    };
  }

  if (elm.type === "return") {
    return {
      ...elm,
      cur: flatRogue[logName] as CapturedValue,
    };
  }

  if (elm.type === "chk") {
    console.log("not impl: mulitple rogue chk logs, silently dropped.");
    return elm;
  }

  if (elm.type === "user") {
    return {
      ...elm,
      cur: elm.cur.concat(flatRogue[logName]),
    };
  }

  throw assertNever(elm);
};

/**
 *
 */
export const mergeTestLogsAndRogue_helper_by_ref = (
  flatRogue: UserTestLogs,
  output: ZippedTestLog[],
  prefix = ""
) => {
  Object.entries(flatRogue).forEach(([key, value]) => {
    if (value === undefined) {
      //we have to regard undefined as no value
      return;
    }

    //add rogue log to ordinary logs (because there isn't an entry for the log type)

    if (key === "err") {
      output.push({
        type: "err",
        name: prefix + "err",
        exp: [],
        cur: value as unknown as ErrorData[],
      });
      return;
    }

    if (key === "return") {
      output.push({
        type: "return",
        name: prefix + "return",
        cur: value as CapturedValue,
      });
      return;
    }

    if (key === "chk") {
      output.push({
        type: "chk",
        name: prefix + "chk",
        ...(value as unknown as ChkInfo),
      });
      return;
    }

    //it must be a user log

    output.push({
      type: "user",
      name: prefix + key,
      exp: [],
      cur: value,
    });
  });
};

/**
 *
 */
const testLogsToFlat = (logs: TestCurLogs | TestExpLogs): UserTestLogs => {
  const res: any = { ...logs };

  const user = logs.user;

  delete res.user;

  Object.entries(user).forEach(([key, value]) => {
    res[key] = value;
  });

  return res;
};

/**
 * todo: wouldn't it be better to be able to store LogEntry directly in test-logs
 *        jate could combine log entries before sending to view, if that's desired.
 * todo: name may collide with logs from the test case.
 */
export const combineTestResultWithLogEntries_byref = (
  cur: TestCurLogs,
  logs: LogEntry[]
) => {
  logs.forEach((msg) => {
    switch (msg.type) {
      case "log": {
        const logName = msg.logName ?? "log";
        const old = cur.user[logName] ?? [];

        cur.user[logName] = [...old, ...msg.data];
        return;
      }

      case "stream": {
        const logName = msg.logName ?? "log";

        //quick fix - until test logs support streams

        if (cur.user[logName] === undefined) {
          cur.user[logName] = [""];
        } else {
          if (def(cur.user[logName]).length !== 1) {
            err("logStream should have one entry.", cur);
          }

          if (typeof def(cur.user[logName])[0] !== "string") {
            err("logStream should be a string.", cur);
          }
        }

        const old = def(cur.user[logName])[0];

        cur.user[logName] = [old + msg.data.toString()];
        return;
      }

      case "html": {
        const errLog = cur.err || (cur.err = []);

        errLog.push(unknownToErrorData(new Error("Combining html entries is not impl"), [msg])); // prettier-ignore

        return;
      }

      case "error": {
        const errLog = cur.err || (cur.err = []);

        errLog.push(msg.data);
        return;
      }

      default: {
        const errLog = cur.err || (cur.err = []);

        errLog.push(unknownToErrorData(new Error("Unknown log type"), [msg])); // prettier-ignore

        return;
      }
    }
  });
};
