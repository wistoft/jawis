import React, { memo } from "react";

import { assertNever, CapturedValue, indent, tos } from "^jab";
import { toAtomizedString, replaceAtoms, ViewDiff } from "^jab-react";
import { ViewException } from "^view-exception";
import { parseErrorData } from "^parse-captured-stack";

import { ZippedTestLog, ViewErrorLog, ViewErrorLogProps } from "./internal";

export type ShowType = "cmp" | "exp" | "cur";

export type ViewTestLogContentProps = {
  testLog: ZippedTestLog;
  showTestLogType: ShowType;
} & Omit<ViewErrorLogProps, "testLog">;

/**
 * - Presents the test log.
 * - The test log is converted to string, before expected and current are diff'ed.
 */
export const ViewTestLogContent: React.FC<ViewTestLogContentProps> = memo(
  ({ testLog, showTestLogType, ...extra }) => {
    switch (testLog.type) {
      case "err":
        return <ViewErrorLog {...extra} testLog={testLog} />;

      case "return":
        return renderHelper(
          capturedToString(testLog.exp),
          capturedToString(testLog.cur),
          showTestLogType
        );

      case "chk": {
        const diff = renderHelper(
          capturedToString(testLog.exp),
          capturedToString(testLog.cur),
          showTestLogType
        );

        //quick fix: remove message. Maybe server just doesn't send it.
        const err = { msg: "", info: [], stack: testLog.stack };

        return (
          <>
            {diff}

            <div
              style={{ marginLeft: "16px" }} //equivalent to 2 spaces.
            >
              <ViewException
                {...extra}
                errorData={parseErrorData(err)}
                onToggleEntry={() => {
                  console.log("onToggleEntry");
                }}
              />
            </div>
          </>
        );
      }

      case "user": {
        const left = capturedArrayToString(testLog.exp);
        const right = capturedArrayToString(testLog.cur);

        return renderHelper(left, right, showTestLogType);
      }

      default:
        return assertNever(testLog);
    }
  }
);

ViewTestLogContent.displayName = "ViewTestLogContent";

//
// util
//

/**
 *
 */
export const renderHelper = (
  left: string,
  right: string,
  showTestLogType: ShowType
) => {
  switch (showTestLogType) {
    case "cmp":
      return <ViewDiff left={left} right={right} />;

    case "exp":
      return <pre>{replaceAtoms(left)}</pre>;

    case "cur":
      return <pre>{replaceAtoms(right)}</pre>;

    default:
      throw assertNever(showTestLogType);
  }
};

/**
 *
 * Like capturedArrayEntriesTos(), but for toAtomizedString()
 */
export const capturedArrayToString = (arr: CapturedValue[]) => {
  try {
    return arr.reduce<string>(
      (acc, value) =>
        acc + (acc === "" ? "" : "\n") + indent(toAtomizedString(value), 1),
      ""
    );
  } catch (unk) {
    return "Coundn't parse CapturedValue\n" + tos(arr);
  }
};

/**
 *
 */
export const capturedToString = (value?: CapturedValue) => {
  if (value === undefined) {
    return "";
  }

  return capturedArrayToString([value]);
};
