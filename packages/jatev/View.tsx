import React, { memo } from "react";

import { def } from "^jab";

import { JsLink } from "^jab-react";
import {
  ViewTest,
  ViewTestProps,
  ViewExecutionList,
  ViewTestLog,
  StateCallbacks,
  State,
} from "./internal";

export type ViewProps = {
  state: State;
} & Pick<
  StateCallbacks,
  "clearAllRogueData" | "showTestCase" | "onCloseTestCase" | "onPrev" | "onNext"
> &
  Omit<ViewTestProps, "currentTest" | "onCloseTestCase" | "onPrev" | "onNext">;

/**
 *
 */
export const View: React.FC<ViewProps> = memo(({ state, ...extra }) => (
  <div>
    {state.userMessage}

    <ViewExecutionList
      tests={state.tests?.tests}
      currentTestId={state.currentTest?.id}
      executingTestId={state.executingTest?.id}
      {...extra}
    />

    {state.currentTest && (
      <ViewTest
        {...extra}
        key={def(state.currentTestFressness)}
        currentTest={state.currentTest}
      />
    )}

    {state.unknownRogue && (
      <>
        <hr />
        <div style={{ textAlign: "end" }}>
          <JsLink name="Clear" onClick={() => extra.clearAllRogueData()} />
        </div>

        {state.unknownRogue.map((testLog, index) => (
          <ViewTestLog
            {...extra}
            key={index}
            testId={"dummy testid"}
            testLog={testLog}
            rogue={true}
          />
        ))}
      </>
    )}
  </div>
));

View.displayName = "View";
