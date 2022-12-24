import { TestProvision } from "^jarun";

import { parseTrace } from "^parse-captured-stack";

export default (prov: TestProvision) => {
  prov.eq([], parseTrace({ type: "node", stack: "" }));
  prov.eq([], parseTrace({ type: "node", stack: "\n" }));
};
