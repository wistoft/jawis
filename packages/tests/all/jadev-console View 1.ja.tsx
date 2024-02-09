import { TestProvision } from "^jarun";

import { getPrettyHtml } from "^misc/node";
import { getView } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getPrettyHtml(getView()));
};
