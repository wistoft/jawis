import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^misc/node";
import { getDevComponentPanel } from "../_fixture";

// no matching route

export default ({ imp }: TestProvision) => {
  imp(getHtmlEnzyme(getDevComponentPanel({}, "/blabla")));
};
