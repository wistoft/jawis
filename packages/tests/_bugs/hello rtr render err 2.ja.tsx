import React from "react";

import RTR from "react-test-renderer";
import { TestProvision } from "^jarun";

import { rendererTos } from "^misc/node";

import { makeTestErrorBoundary, ThrowInRender } from "../_fixture";

export default (prov: TestProvision) => {
  const TestErrorBoundary = makeTestErrorBoundary();

  //bug: RTR.create doesn't throw, as without EB

  const renderer = RTR.create(
    <TestErrorBoundary>
      <ThrowInRender />
    </TestErrorBoundary>
  );

  prov.imp(rendererTos(renderer));
};
