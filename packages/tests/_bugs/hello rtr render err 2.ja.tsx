import React from "react";

import RTR from "react-test-renderer";
import { TestProvision } from "^jarun";

import { rendererTos } from "^jawis-mess/node";

import { TestErrorBoundary, ThrowInRender } from "../_fixture";

export default (prov: TestProvision) => {
  //bug: RTR.create doesn't throw, as without EB

  const renderer = RTR.create(
    <TestErrorBoundary>
      <ThrowInRender />
    </TestErrorBoundary>
  );

  prov.imp(rendererTos(renderer));
};
