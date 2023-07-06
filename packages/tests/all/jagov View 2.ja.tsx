import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getJagoView } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlRTR(getJagoView()));
};
