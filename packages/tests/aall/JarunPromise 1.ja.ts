import { TestProvision } from "^jarun";

import { newJarunPromise } from "../_fixture";

export default (prov: TestProvision) =>
  newJarunPromise(prov, (resolve) => {
    resolve("hello");
  })
    .then(() => {
      prov.div("then");
    })
    .catch(() => {
      prov.div("catch doesn't happen");
    });
