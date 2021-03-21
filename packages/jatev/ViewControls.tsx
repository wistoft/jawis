import React, { memo } from "react";
import { def } from "^jab";

import { JsLink, TogglePanel } from "^jab-react";

import { ClientApiSendProv } from "./util";

export type Props = ClientApiSendProv & {
  isRunning: boolean;
  executingTestId: string | undefined;
  onShowTestCase: (test: string) => void;
  onAcceptAllLogs: () => void;
};

export const ViewControls: React.FC<Props> = memo((props) => {
  const startStopLink = (
    <JsLink
      name={props.isRunning ? "stop" : "start"}
      onClick={() => props.apiSend({ action: "stopRunning" })}
      title={props.isRunning ? "Stop test execution" : "Start test execution"}
    />
  );

  const accLink = (
    <JsLink
      name="aal"
      onClick={props.onAcceptAllLogs}
      title="Accept all test logs"
    />
  );

  return (
    <span style={{ color: "var(--link-color)" }}>
      {" - "}
      {accLink}, {startStopLink},{" "}
      <TogglePanel
        linkName="set"
        linkTitle={"Show executing test"}
        initial={false}
      >
        {props.executingTestId && (
          <>
            {", "}
            <JsLink
              name={props.executingTestId}
              onClick={() => props.onShowTestCase(def(props.executingTestId))}
              title="Show executing test"
            />
          </>
        )}
      </TogglePanel>
    </span>
  );
});

ViewControls.displayName = "ViewControls";
