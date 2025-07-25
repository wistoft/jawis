import React from "react";

import { JsLink } from "^jab-react";

import { ConsoleStateProv, ViewEntry, ViewEntryProps } from "./internal";

export type ViewProps = { showClearLink?: boolean } & Pick<
  ConsoleStateProv,
  "logs" | "clearAllLogs"
> &
  Omit<ViewEntryProps, "entry" | "multiLineEntryMarginBottom" | "colorMap">;

/**
 *
 */
export const View: React.FC<ViewProps> = ({
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
