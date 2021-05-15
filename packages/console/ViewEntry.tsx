import React, { CSSProperties } from "react";

import { ViewException, ViewExceptionProps } from "^util/web";
import { assertNever } from "^jab";

import { ConsoleStateProv } from "./useConsoleState";
import { UiEntry } from ".";
import { ViewLogEntry } from "./ViewLogEntry";
import { JsLink } from "^jab-react";

export type Props = {
  entry: UiEntry;
} & Pick<ConsoleStateProv, "useToggleEntry" | "useRemoveEntry"> &
  Omit<RenderEntryProps, "onToggleEntry">;

/**
 *
 * -
 */
export const ViewEntry: React.FC<Props> = (props) => {
  const { entry, useToggleEntry, useRemoveEntry, ...extra } = props;

  const onToggleEntry = useToggleEntry(entry.id);
  const onRemoveEntry = useRemoveEntry(entry.id);

  // two elements for grid layout.

  return (
    <React.Fragment key={entry.id}>
      <pre
        onClick={onToggleEntry}
        style={{
          cursor: "pointer",
          paddingRight: "15px",
        }}
      >
        <JsLink
          name="-"
          onClick={onRemoveEntry}
          style={{
            color: "var(--text-color-faded)",
          }}
        />
      </pre>
      <div>{renderEntry({ ...extra, entry, onToggleEntry })}</div>
    </React.Fragment>
  );
};

//
// util
//

type RenderEntryProps = {
  entry: UiEntry;
} & Omit<ViewExceptionProps, "errorData" | "wrapperStyle" | "messageStyle">;

/**
 *
 */
const renderEntry = ({ entry, onToggleEntry, ...extra }: RenderEntryProps) => {
  const subProps = {
    wrapperStyle: {
      overflowY: "hidden",
      maxHeight: entry.expandEntry ? "unset" : "100px",
    } as CSSProperties,
    onToggleEntry,
  };

  switch (entry.type) {
    case "error":
      return <ViewException {...extra} {...subProps} errorData={entry.data} />;

    case "log":
      return <ViewLogEntry {...subProps} entry={entry} />;

    case "html":
      return <div dangerouslySetInnerHTML={{ __html: entry.data }} />;

    case "stream-line":
      return <div className={"divPre scrollbox"}>{entry.data}</div>;

    default:
      return assertNever(entry);
  }
};
