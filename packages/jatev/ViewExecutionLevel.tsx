import React, { memo } from "react";

import { JsLink } from "^jab-react";

import { TestState } from ".";

export type Props = {
  level: TestState[];
  currentTestId?: string;
  executingTestId?: string;
  onShowTestCase: (test: string) => void;
};

export const ViewExecutionLevel: React.FC<Props> = memo((props) => (
  <>
    {props.level.length === 0 ? (
      <br />
    ) : (
      <div
        style={{
          letterSpacing: "0.05em",
          overflowWrap: "break-word",
          lineHeight: "100%",
        }}
      >
        {props.level.map((testcase) => {
          let style: React.CSSProperties = {};
          let displayChar: string | number;

          const isExecuting = props.executingTestId === testcase.id;

          if (isExecuting) {
            displayChar = ".";
            style = {
              fontSize: "120%",
              color: "var(--jatev-executing-test-color)",
            };
          } else if (testcase.status === undefined) {
            displayChar = ".";
            style = {
              fontSize: "120%",
              color: "var(--jatev-unknown-test-status-color)",
            };
          } else if (testcase.status === ".") {
            displayChar = testcase.status;
            style = {
              fontSize: "120%",
              color: "var(--jatev-test-done-color)",
            };
          } else {
            displayChar = testcase.status;
            style = {
              fontSize: "80%",
              color: "var(--jatev-test-done-color)",
            };
          }

          return (
            <JsLink
              key={testcase.id}
              onClick={() => props.onShowTestCase(testcase.id)}
              title="Show test case"
              href={"Case: " + testcase.id}
              style={style}
            >
              {testcase.id === props.currentTestId ? (
                <b>{displayChar}</b>
              ) : (
                displayChar
              )}
            </JsLink>
          );
        })}
      </div>
    )}
  </>
));

ViewExecutionLevel.displayName = "ViewExecutionLevel";
