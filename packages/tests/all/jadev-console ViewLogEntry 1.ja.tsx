import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^jawis-mess/node";
import { getViewLogEntry } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getViewLogEntry()));
};
