import { TestProvision } from "^jarun";

import { addDataUpdate_empty, errorData2 } from "../_fixture";

//no source map

export default (prov: TestProvision) =>
  addDataUpdate_empty(prov, [
    { type: "error", context: "browser", data: errorData2 },
  ]).then((state) => {
    prov.imp(state);
  });
