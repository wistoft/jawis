import React from "react";

import { TestProvision } from "^jarun";

import { render } from "enzyme";
import { TestErrorBoundary, ThrowInRender } from "../_fixture";

//render throws within EB

export default (prov: TestProvision) => {
  render(
    <TestErrorBoundary>
      <ThrowInRender />
    </TestErrorBoundary>
  );

  prov.imp("unreach");
};
