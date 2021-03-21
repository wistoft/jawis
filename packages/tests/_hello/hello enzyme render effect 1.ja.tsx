import React from "react";

import { TestProvision } from "^jarun";

import { render } from "enzyme";
import { ThrowInEffect } from "../_fixture";

//render ignores effects.

export default (prov: TestProvision) => {
  prov.imp(render(<ThrowInEffect />));
};
