import React from "react";

import RTR from "react-test-renderer";
import { TestProvision } from "^jarun";

import { ThrowInRender } from "../_fixture";

//render throws

export default (prov: TestProvision) => {
  RTR.create(<ThrowInRender />);

  prov.imp("unreach");
};
