import React, { memo } from "react";

import { def } from "^jab";

import { ViewTest, ViewTestProps } from "./ViewTest";
import { StateCallbacks, State } from ".";
import { ViewExecutionList } from "./ViewExecutionList";
import { ViewTestLog } from "./ViewTestLog";

// props

export type ViewProps = {
  state: State;
  callbacks: StateCallbacks;
} & Omit<
  ViewTestProps,
  "currentTest" | "onCloseTestCase" | "onPrev" | "onNext"
>;

/**
 *
 */
export const View: React.FC<ViewProps> = memo(
  ({ state, callbacks, ...extra }) => (
    <div>
      {state.userMessage}

      <ViewExecutionList
        tests={state.tests?.tests}
        currentTestId={state.currentTest?.id}
        executingTestId={state.executingTestId}
        showTestCase={callbacks.showTestCase}
      />

      {state.currentTest && (
        <ViewTest
          {...extra}
          {...callbacks}
          key={def(state.currentTestFressness)}
          currentTest={state.currentTest}
        />
      )}

      {state.unknownRogue && (
        <>
          <hr />
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
  )
);

View.displayName = "View";
