import React, { ReactNode, useState } from "react";

import { JsLink } from "./internal";

type Props = {
  linkName: string;
  linkTitle?: string;
  initial: boolean;
  children: ReactNode;
};

/**
 * Show a link before the content, to allow show/hide toggle.
 */
export const TogglePanel: React.FC<Props> = (props) => {
  const [showPanel, setShowTestLog] = useState(props.initial);

  const toggleShowTestLog = () => {
    setShowTestLog((old) => !old);
  };

  return (
    <>
      <JsLink
        name={props.linkName}
        onClick={toggleShowTestLog}
        title={props.linkTitle}
      />
      &nbsp; {showPanel && props.children}
    </>
  );
};
