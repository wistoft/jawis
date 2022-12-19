import { CapturedValue, ErrorData, CapturedStack } from "^jab";

//
// base types
//

export type TestStatus = "." | number;

export type TestLogMatchType =
  | "nothing"
  | "only-current"
  | "only-expected"
  | "match"
  | "different";

export type UserTestLogs = { [_: string]: CapturedValue[] };

export type TestCurLogs = {
  err?: ErrorData[];
  return?: CapturedValue;
  chk?: ChkInfo;
  user: UserTestLogs;
};

export type TestExpLogs = {
  err?: string[];
  return?: CapturedValue;
  user: UserTestLogs;
};

export type ChkInfo = {
  exp: CapturedValue;
  cur: CapturedValue;
  stack: CapturedStack;
};

//
// compound
//

export type TestResult = {
  cur: TestCurLogs;
  execTime?: number;
  requireTime?: number;
};

export type JatesTestReport = {
  id: string;
  status: TestStatus;
  zippedTestLogs: ZippedTestLog[]; //generated on server, because it's easy to do, when calculating status.
  result: TestResult;
};

//
// more
//

export type ClientTestReport = {
  id: string;
  status: TestStatus;
  testLogs: ZippedTestLog[];
};

export type ZippedTestLog = ErrorLog | ChkLog | ReturnLog | UserLog;

export type ErrorLog = {
  type: "err";
  name: string;
  exp: string[];
  cur: ErrorData[];
};

export type ReturnLog = {
  type: "return";
  name: string;
  exp?: CapturedValue;
  cur?: CapturedValue;
};

export type ChkLog = {
  type: "chk";
  name: string;
} & ChkInfo;

export type UserLog = {
  type: "user";
  name: string;
  exp: CapturedValue[];
  cur: CapturedValue[];
};
