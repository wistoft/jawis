import React from "react";

import { capturedTos } from "^jab";
import { clonedArrayEntriesToHtml, ClickableDivBackground } from "^jab-react";

import { LogEntry } from "^jagoc";

export const multiLineEntryMarginBottom = "10px";

export type Props = {
  entry: LogEntry;
  wrapperStyle: React.CSSProperties;
  onToggleEntry: () => void;
};

export const ViewLogEntry = ({
  entry: { data },
  wrapperStyle,
  onToggleEntry,
}: Props) => {
  const firstValueIsMultiLine =
    data.length === 1 && capturedTos(data[0]).includes("\n");

  const moreThanOneLine = firstValueIsMultiLine || data.length > 1;

  const ownStyle = moreThanOneLine
    ? { marginBottom: multiLineEntryMarginBottom }
    : undefined;

  let content;
  if (data.length === 0) {
    content = <i>NoArgs</i>;
  } else {
    content = <span>{clonedArrayEntriesToHtml(data)}</span>;
  }

  return (
    <ClickableDivBackground
      onClick={onToggleEntry}
      style={{ ...wrapperStyle, ...ownStyle }}
      className={"divPre scrollbox"}
    >
      {content}
    </ClickableDivBackground>
  );
};
