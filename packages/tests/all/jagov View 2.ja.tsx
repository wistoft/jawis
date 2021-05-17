import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^misc/node";
import { getJagoView } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlEnzyme(getJagoView()));
};
//
