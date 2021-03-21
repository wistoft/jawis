import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^jawis-mess/node";
import { getView } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getView()));
};
