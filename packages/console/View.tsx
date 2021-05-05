import React from "react";

import { JsLink } from "^jab-react";

import { ConsoleStateProv } from "./useConsoleState";
import { ViewEntry, Props as ViewEntryProps } from "./ViewEntry";

export type Props = { showClearLink?: boolean } & Pick<
  ConsoleStateProv,
  "logs" | "clearAllLogs"
> &
  Omit<ViewEntryProps, "entry" | "multiLineEntryMarginBottom" | "colorMap">;

/**
 *
 */
export const View: React.FC<Props> = ({
  showClearLink,
  logs,
  clearAllLogs,
  ...extra
}) => {
  if (logs.length === 0) {
    return null;
  }

  return (
    <>
      {(showClearLink === undefined || showClearLink) && (
        <div style={{ float: "right" }}>
          <JsLink name="Clear" onClick={clearAllLogs} />
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gridRowGap: "2px",
          clear: "both",
        }}
      >
        {logs.map((entry) => (
          <ViewEntry {...extra} key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  );
};
