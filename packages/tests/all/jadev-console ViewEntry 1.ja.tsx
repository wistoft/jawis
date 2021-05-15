import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getViewEntry } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getViewEntry({})));
};
