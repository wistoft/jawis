import React, { memo } from "react";

import { assertNever } from "^jab";
import { ErrorLog } from "^jatec";
import {
  filterErrorMessage,
  parseErrorData,
  ViewException,
  ViewExceptionProps,
} from "^util-javi/web";

import { errLogDiff } from "./util";

export type Props = {
  testLog: ErrorLog;
} & Omit<
  ViewExceptionProps,
  "errorData" | "wrapperStyle" | "messageStyle" | "onToggleEntry"
>;

/**
 *
 */
export const ViewErrorLog: React.FC<Props> = memo(({ testLog, ...extra }) => {
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
});

ViewErrorLog.displayName = "ViewErrorLog";
