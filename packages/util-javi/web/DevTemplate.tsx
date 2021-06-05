import React, { ReactNode } from "react";

import { ScrollbarTail } from "^jab-react";

type Props = {
  mainPanel: ReactNode;
  consolePanel: ReactNode;
};

/**
 *
 */
export const DevTemplate: React.FC<Props> = ({ mainPanel, consolePanel }) => (
  <div
    style={{
      display: "flex",
      /* So we don't get a outer scrollbar. There are already two. One for content, and one for console. */
      height: "100vh",
    }}
  >
    <div style={{ flexShrink: 100000, width: "250px" }} />

    <div
      style={{
        flexShrink: 3,
        flexGrow: 1,
        overflowY: "auto",
        padding: "10px",
        minWidth: "200px",
      }}
    >
      {mainPanel}
    </div>

    <ScrollbarTail
      style={{
        flexShrink: 1,
        overflowY: "auto",
        padding: "10px",
        paddingRight:
          "20px" /* larger than other padding, to allow for the scrollbar. */,
      }}
    >
      {consolePanel}
    </ScrollbarTail>
  </div>
);
