import React from "react";
import { render } from "enzyme";

import { TestProvision } from "^jarun";

import { ThrowInRender } from "../_fixture";

//render throws

export default (prov: TestProvision) => {
  render(<ThrowInRender />);

  prov.imp("unreach");
};
