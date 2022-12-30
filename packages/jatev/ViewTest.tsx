import React, { memo } from "react";

import { JsLink } from "^jab-react";
import { ViewTestLog, ViewTestLogProps, TestState } from "./internal";

export type ViewTestProps = {
  currentTest: TestState;
  onCloseTestCase: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRunCurrentTest: () => void;
  onEditCurrentTest: () => void;
} & Omit<ViewTestLogProps, "testId" | "testLog" | "rogue">;

export const ViewTest: React.FC<ViewTestProps> = memo(
  ({
    currentTest,
    onCloseTestCase,
    onPrev,
    onNext,
    onRunCurrentTest,
    onEditCurrentTest,
    ...extra
  }) => (
    <>
      <JsLink name="<" onClick={onPrev} title="Previous test case" />
      <JsLink name="-" onClick={onCloseTestCase} title="Close test case" />
      <JsLink name={">"} onClick={onNext} title="Next test case" />{" "}
      <JsLink name="rerun" onClick={onRunCurrentTest} title="Rerun test case" />
      &nbsp;&nbsp;&nbsp;&nbsp;
      <JsLink
        name={currentTest.id}
        onClick={onEditCurrentTest}
        title="Edit test case"
      />
      {currentTest.testLogs &&
        currentTest.testLogs.map((testLog) => (
          <ViewTestLog
            {...extra}
            key={testLog.name}
            testId={currentTest.id}
            testLog={testLog}
            rogue={currentTest.rogue === true}
          />
        ))}
    </>
  )
);

ViewTest.displayName = "ViewTest";
