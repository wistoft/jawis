import { TestProvision } from "^jarun";

import { errorData1, getAddDataUpdate_empty } from "../_fixture";

//no source map

export default (prov: TestProvision) =>
  getAddDataUpdate_empty([
    { type: "error", context: "server", data: errorData1 },
  ]);
