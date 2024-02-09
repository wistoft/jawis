import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { getViewLogEntry } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getPrettyHtml(getViewLogEntry()));
};
