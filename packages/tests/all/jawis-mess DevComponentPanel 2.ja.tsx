import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getDevComponentPanel } from "../_fixture";

// no matching route

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getDevComponentPanel({}, "/blabla")));
};
