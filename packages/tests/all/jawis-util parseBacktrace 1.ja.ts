import { TestProvision } from "^jarun";

import { parseTrace } from "^util-javi/web";

export default (prov: TestProvision) => {
  prov.eq([], parseTrace({ type: "node", stack: "" }));
  prov.eq([], parseTrace({ type: "node", stack: "\n" }));
};
