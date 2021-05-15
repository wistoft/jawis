import React, { memo } from "react";

import { assertNever, ClonedValue, indent, tos } from "^jab";
import { ZippedTestLog } from "^jatec";
import { toAtomizedString, replaceAtoms } from "^jab-react";

import { ViewDiff } from "./ViewDiff";
import { ViewErrorLog, Props as ViewErrorLogProps } from "./ViewErrorLog";
import { parseErrorData, ViewException } from "^util/web";

export type ShowType = "cmp" | "exp" | "cur";

export type Props = {
  testLog: ZippedTestLog;
  showTestLogType: ShowType;
} & Omit<ViewErrorLogProps, "testLog">;

/**
 * - Presents the test log.
 * - The test log is converted to string, before expected and current are diff'ed.
 */
export const ViewTestLogContent: React.FC<Props> = memo(
  ({ testLog, showTestLogType, ...extra }) => {
    switch (testLog.type) {
      case "err":
        return <ViewErrorLog {...extra} testLog={testLog} />;

      case "return":
        return renderHelper(
          clonedToString(testLog.exp),
          clonedToString(testLog.cur),
          showTestLogType
        );

      case "chk": {
        const diff = renderHelper(
          clonedToString(testLog.exp),
          clonedToString(testLog.cur),
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
        const left = clonedArrayToString(testLog.exp);
        const right = clonedArrayToString(testLog.cur);

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
 * Like clonedArrayEntriesTos(), but for toAtomizedString()
 */
export const clonedArrayToString = (arr: ClonedValue[]) => {
  try {
    return arr.reduce<string>(
      (acc, value) =>
        acc +
        (acc === "" ? "" : "\n") +
        "\t" +
        indent(toAtomizedString(value), 1),
      ""
    );
  } catch (unk) {
    return "Coundn't parse ClonedValue\n" + tos(arr);
  }
};

/**
 *
 */
export const clonedToString = (value?: ClonedValue) => {
  if (value === undefined) {
    return "";
  }

  return clonedArrayToString([value]);
};
