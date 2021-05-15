import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getViewLogEntry } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getViewLogEntry()));
};
