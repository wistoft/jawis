import React, { memo } from "react";

import { basename } from "^jab";
import { useKeyListener } from "^jab-react";
import { ViewProps as ConsoleProps, View as ConsoleView } from "^console";

import {
  ScriptStatus,
  getEditLink,
  getRestartLink,
  getScriptColor,
  getStopLink,
  ApiProv,
  getKillLink,
} from "./internal";

export type ViewScriptProps = {
  singleProcessStatus: ScriptStatus;
  jcvProps: Omit<ConsoleProps, "showClearLink">;
} & Pick<ApiProv, "apiSend">;

/**
 *
 */
export const ViewScript: React.FC<ViewScriptProps> = memo((props) => {
  const {
    singleProcessStatus: { script, status, time },
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
      {getRestartLink(props.apiSend, script)}{" "}
      {getStopLink(props.apiSend, script)} {getKillLink(props.apiSend, script)}{" "}
      {getEditLink(props.apiSend, script)}
      {" - "}
      <span style={{ color: getScriptColor(status) }}>{basename(script)}</span>
      {status === "preloading" && " - preloading"}
      {time !== undefined && " - " + time}
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
