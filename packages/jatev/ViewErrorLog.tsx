import React, { memo } from "react";

import { assertNever } from "^jab";
import { parseErrorData } from "^parse-captured-stack";
import {
  filterErrorMessage,
  ViewException,
  ViewExceptionProps,
} from "^view-exception";

import { ErrorLog, errLogDiff } from "./internal";

export type ViewErrorLogProps = {
  testLog: ErrorLog;
} & Omit<
  ViewExceptionProps,
  "errorData" | "wrapperStyle" | "messageStyle" | "onToggleEntry"
>;

/**
 *
 */
export const ViewErrorLog: React.FC<ViewErrorLogProps> = memo(
  ({ testLog, ...extra }) => {
    const diff = errLogDiff(testLog.exp || [], testLog.cur);

    const mappedDiff = diff.map((elm, index) => {
      switch (elm[0]) {
        case "del":
          return (
            <pre key={index}>
              <del>{filterErrorMessage(elm[1])}</del>
            </pre>
          );

        case "eq":
          return (
            <ViewException
              {...extra}
              key={index}
              errorData={parseErrorData(elm[1])}
              onToggleEntry={() => {
                console.log("onToggleEntry");
              }}
            />
          );

        case "ins":
          return (
            <ViewException
              {...extra}
              key={index}
              errorData={parseErrorData(elm[1])}
              messageStyle={{ color: "var(--green)" }}
              onToggleEntry={() => {
                console.log("onToggleEntry");
              }}
            />
          );

        default:
          throw assertNever(elm[0]);
      }
    });

    return (
      <div
        style={{ marginLeft: "16px" }} //equivalent to 2 spaces.
      >
        {mappedDiff}
      </div>
    );
  }
);

ViewErrorLog.displayName = "ViewErrorLog";
