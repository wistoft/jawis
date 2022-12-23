import React, { memo } from "react";

import { ParsedErrorData } from "^jab";
import { ClickableDivBackground, clonedArrayEntriesToHtml } from "^jab-react";

import {
  filterErrorMessage,
  ViewExceptionCallStack,
  ViewExceptionCallStackProps,
} from "./internal";

export type ViewExceptionProps = {
  errorData: ParsedErrorData;
  wrapperStyle?: React.CSSProperties;
  messageStyle?: React.CSSProperties;
  onToggleEntry: () => void;
} & Omit<ViewExceptionCallStackProps, "stack">;

const lineMargin = <div style={{ marginTop: "10px" }} />;

/**
 *
 * - onToggleEntry is taken to allow controlling visibility toggle from outside. If one wants to
 *    collaps all `ViewException` components, one can have contral state for that.
 */
export const ViewException: React.FC<ViewExceptionProps> = memo(
  ({
    errorData: { msg, info, parsedStack: stack },
    wrapperStyle,
    messageStyle,
    onToggleEntry = () => {},
    ...extra
  }) => (
    <ClickableDivBackground
      onClick={onToggleEntry}
      style={{
        ...wrapperStyle,
        marginBottom: "10px",
        color: "var(--jawis-console-text-color)",
      }}
      className={"divPre scrollbox"}
    >
      <span style={messageStyle}>{filterErrorMessage(msg)}</span>
      {lineMargin}

      <div
        style={{ marginLeft: "16px" }} //equivalent to 2 spaces.
      >
        <div
          style={{ marginLeft: "16px" }} //equivalent to 2 spaces.
        >
          {clonedArrayEntriesToHtml(info)}
          {lineMargin}
        </div>

        <ViewExceptionCallStack {...extra} stack={stack} />
      </div>
    </ClickableDivBackground>
  )
);

ViewException.displayName = "ViewException";
