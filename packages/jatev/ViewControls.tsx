import React, { memo } from "react";

import { def } from "^jab";
import { JsLink, TogglePanel } from "^jab-react";

import { State, ApiProv } from "./internal";

type Props = Pick<ApiProv, "apiSend"> &
  Pick<State, "executingTest"> & {
    isRunning: boolean;
    runFailedTests: () => void;
    acceptAllLogs: () => void;
    showTestCase: (test: string) => void;
  };

export const ViewControls: React.FC<Props> = memo((props) => {
  const startStopLink = (
    <JsLink
      name={props.isRunning ? "stop" : "start"}
      onClick={() => props.apiSend({ type: "toggleRunning" })}
      title={props.isRunning ? "Stop test execution" : "Start test execution"}
    />
  );

  const runFailedLink = (
    <JsLink
      name="run-failed"
      onClick={props.runFailedTests}
      title="Run failed tests"
    />
  );

  const accLink = (
    <JsLink
      name="accept-all"
      onClick={props.acceptAllLogs}
      title="Accept all test logs"
    />
  );

  return (
    <span style={{ color: "var(--link-color)" }}>
      {" - "}
      {startStopLink}, {runFailedLink}, {accLink},{" "}
      <TogglePanel
        linkName="set"
        linkTitle={"Show executing test"}
        initial={false}
      >
        {props.executingTest && (
          <>
            {", "}
            <JsLink
              name={props.executingTest.name}
              onClick={() => props.showTestCase(def(props.executingTest).id)}
              title="Show executing test"
            />
          </>
        )}
      </TogglePanel>
    </span>
  );
});

ViewControls.displayName = "ViewControls";
