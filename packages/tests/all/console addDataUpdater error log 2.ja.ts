import { TestProvision } from "^jarun";

import { errorData2, getAddDataUpdate_empty } from "../_fixture";

//no source map

export default (prov: TestProvision) =>
  getAddDataUpdate_empty([
    { type: "error", context: "browser", data: errorData2 },
  ]);
