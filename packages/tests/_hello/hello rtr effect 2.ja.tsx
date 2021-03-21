import React from "react";

import RTR from "react-test-renderer";
import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

import { HelloEffect } from "../_fixture";

//effects

export default (prov: TestProvision) => {
  const renderer = RTR.create(<HelloEffect />);

  renderer.unmount(); //both mount and unmount effect are executed here.

  return sleeping(100);
};
//
