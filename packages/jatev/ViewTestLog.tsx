import React, { memo, useState } from "react";

import { assertNever } from "^jab";
import { JsLink } from "^jab-react";
import { TestLogMatchType, ZippedTestLog } from "^jatec";

import {
  ClientApiSendProv,
  getDefaultShowTestState,
  getTestLogMatchType,
} from "./util";
import {
  ViewTestLogContent,
  ViewTestLogContentProps,
} from "./ViewTestLogContent";

export type ViewTestLogProps = {
  testId: string;
  testLog: ZippedTestLog;
  rogue: boolean;
  apiSend: ClientApiSendProv["apiSend"];
} & Omit<ViewTestLogContentProps, "showTestLogType" | "testLog">;

/**
 *
 */
export const ViewTestLog: React.FC<ViewTestLogProps> = memo(
  ({ testId, testLog, rogue, apiSend, ...extra }) => {
    const [showTestLog, setShowTestLog] = useState(() =>
      getDefaultShowTestState(testLog)
    );

    const [showTestLogType, setShowTestLogType] = useState<
      "cmp" | "exp" | "cur"
    >("cmp");

    const toggleShowTestLog = () => {
      setShowTestLog((old) => !old);
    };

    const matchType = getTestLogMatchType(testLog);

    const controls =
      !rogue && getControlLinks(matchType, testLog, testId, apiSend);

    const tlControls = getTestLogLinks(
      matchType,
      testLog,
      testId,
      apiSend,
      setShowTestLogType
    );

    if (matchType === "nothing") {
      return null;
    }

    return (
      <div>
        <JsLink
          name={testLog.name}
          onClick={toggleShowTestLog}
          title={description[matchType]}
          style={{ color: "var(--jatev-test-log-" + matchType + ")" }}
        />
        &nbsp;&nbsp;
        {controls}
        &nbsp;&nbsp;&nbsp;{tlControls}
        {showTestLog && (
          <div
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              color: "var(--jatev-test-log-white-color)",
            }}
          >
            <ViewTestLogContent
              {...extra}
              showTestLogType={showTestLogType}
              testLog={testLog}
            />
          </div>
        )}
      </div>
    );
  }
);

//
// util
//

const description = {
  nothing: "",
  "only-current": "Test log present, nothing expected",
  "only-expected": "Test log expected",
  match: "Test log as expected",
  different: "Different from expected",
};

/**
 * Decides which controls to show.
 */
export const getControlLinks = (
  logType: TestLogMatchType,
  testLog: ZippedTestLog,
  testId: string,
  apiSend: ClientApiSendProv["apiSend"]
) => {
  if (testLog.type === "chk") {
    return null;
  }

  if (testLog.type === "user" && testLog.name.startsWith("rogue.")) {
    return null;
  }

  const acc = (
    <JsLink
      key="acc"
      name="acc"
      onClick={() =>
        apiSend({
          type: "acceptTestLog",
          testId: testId,
          logName: testLog.name,
        })
      }
    />
  );

  const del = (
    <JsLink
      key="del"
      name="del"
      onClick={() =>
        apiSend({
          type: "acceptTestLog",
          testId: testId,
          logName: testLog.name,
        })
      }
    />
  );

  switch (logType) {
    case "nothing":
      return null;
    case "only-current":
      return acc;
    case "only-expected":
      return del;
    case "match":
      return null;
    case "different":
      return acc;
    default:
      assertNever(logType);
  }
};

/**
 * Decides which controls to show for the test logs.
 *
 * - error has no links, because its diff is different.
 */
const getTestLogLinks = (
  logType: TestLogMatchType,
  testLog: ZippedTestLog,
  testId: string,
  apiSend: ClientApiSendProv["apiSend"],
  setShowTestLogType: React.Dispatch<
    React.SetStateAction<"cmp" | "exp" | "cur">
  >
) => {
  if (testLog.type === "err") {
    return;
  }

  if (testLog.type === "user" && testLog.name.startsWith("rogue.")) {
    return;
  }

  const cur = (
    <JsLink key="cur" name="cur" onClick={() => setShowTestLogType("cur")} />
  );

  const exp = (
    <JsLink key="exp" name="exp" onClick={() => setShowTestLogType("exp")} />
  );

  const cmp1 = (
    <JsLink key="cmp1" name="cmp" onClick={() => setShowTestLogType("cmp")} />
  );

  const cmp2 = (
    <React.Fragment key="cpm2">
      &nbsp;&nbsp;&nbsp;
      <JsLink
        name="cmp"
        onClick={() =>
          apiSend({
            type: "compareTestLog",
            testId: testId,
            logName: testLog.name,
          })
        }
      />
    </React.Fragment>
  );

  switch (logType) {
    case "nothing":
      return [];
    case "only-current":
      return [];
    case "only-expected":
      return [];
    case "match":
      return [];
    case "different":
      return [exp, " ", cur, " ", cmp1, cmp2];
    default:
      assertNever(logType);
  }
};

ViewTestLog.displayName = "ViewTestLog";
