import { TestProvision } from "^jarun";

import { addDataUpdate_empty, errorData1 } from "../_fixture";

//no source map

export default (prov: TestProvision) =>
  addDataUpdate_empty(prov, [
    { type: "error", context: "server", data: errorData1 },
  ]).then((state) => {
    prov.log("server log", state);
  });
