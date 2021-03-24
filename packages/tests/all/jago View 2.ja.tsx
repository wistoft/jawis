import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { getJagoView } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlEnzyme(getJagoView()));
};
//
