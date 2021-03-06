import React, { memo } from "react";

import { basename } from "^jab";
import { useKeyListener } from "^jab-react";
import { ScriptStatus } from "^jagoc";
import { Props as ConsoleProps, View as ConsoleView } from "^console";

import {
  getEditLink,
  getRestartLink,
  getScriptColor,
  getStopLink,
} from "./util";
import { ApiProv } from ".";

export type Props = {
  singleProcessStatus: ScriptStatus;
  jcvProps: Omit<ConsoleProps, "showClearLink">;
} & ApiProv;

/**
 *
 */
export const ViewScript: React.FC<Props> = memo((props) => {
  const {
    singleProcessStatus: { script, status },
    jcvProps,
  } = props;

  useKeyListener((e) => {
    if (e.key === "e") {
      props.apiSend({ type: "openFile", file: script });
    }
  });

  //filter

  const filteredLogs = jcvProps.logs.filter(
    (entry) => entry.context === script
  );

  return (
    <>
      <br />
      {getRestartLink(props, script)} {getStopLink(props, script)}{" "}
      {getEditLink(props, script)}
      {" - "}
      <span style={{ color: getScriptColor(status) }}>{basename(script)}</span>
      {status === "preloading" && " - preloading"}
      <br />
      <br />
      <ConsoleView
        {...props.jcvProps}
        logs={filteredLogs}
        showClearLink={false}
      />
    </>
  );
});

ViewScript.displayName = "ViewScript";
