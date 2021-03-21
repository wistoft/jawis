import React from "react";

import RTR from "react-test-renderer";
import { TestProvision } from "^jarun";

import { sleeping } from "^jab";
import { ThrowInEffect } from "../_fixture";

//the noisy can be removed.

export default (prov: TestProvision) => {
  RTR.create(<ThrowInEffect />);

  //to catch react mess
  // 1. the error rethrown async
  // 2. stdout is cluttered.
  return sleeping(100);
};
