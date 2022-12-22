import React, { memo } from "react";

import { ViewExecutionLevel } from "./ViewExecutionLevel";
import { TestState } from ".";

type Props = {
  tests?: TestState[][];
  currentTestId?: string;
  executingTestId?: string;
  showTestCase: (test: string) => void;
};

/**
 *
 */
export const ViewExecutionList: React.FC<Props> = memo(
  ({ tests, ...extra }) => (
    <>
      {tests === undefined ? (
        <br />
      ) : tests.length === 0 ? (
        <>
          <br />
          No tests
        </>
      ) : (
        tests.map((level, index) => (
          <ViewExecutionLevel key={index} level={level} {...extra} />
        ))
      )}
    </>
  )
);

ViewExecutionList.displayName = "ViewExecutionList";
