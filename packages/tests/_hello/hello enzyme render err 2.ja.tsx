import React from "react";

import { TestProvision } from "^jarun";

import { render } from "enzyme";
import { makeTestErrorBoundary, ThrowInRender } from "../_fixture";

//render throws within EB

export default (prov: TestProvision) => {
  const TestErrorBoundary = makeTestErrorBoundary();

  render(
    <TestErrorBoundary>
      <ThrowInRender />
    </TestErrorBoundary>
  );

  prov.imp("unreach");
};
