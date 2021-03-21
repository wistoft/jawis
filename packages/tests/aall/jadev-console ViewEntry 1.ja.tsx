import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^jawis-mess/node";
import { getViewEntry } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getViewEntry({})));
};
