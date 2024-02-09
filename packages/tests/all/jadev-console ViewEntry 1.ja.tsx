import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { getViewEntry } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getPrettyHtml(getViewEntry({})));
};
