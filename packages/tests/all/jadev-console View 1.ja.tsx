import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getView } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getView()));
};
