import React from "react";

import { TestProvision } from "^jarun";

import { getShallowHtmlEnzyme } from "^jawis-mess/node";
import { TestComp } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getShallowHtmlEnzyme(<TestComp />));
};
