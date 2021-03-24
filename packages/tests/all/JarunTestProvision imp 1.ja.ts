import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.imp(undefined);
  inner.imp([1, 2]);
  inner.imp("hej", "dav");

  prov.imp(inner.logs);
};
