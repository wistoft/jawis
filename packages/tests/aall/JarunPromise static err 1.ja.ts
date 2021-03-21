import { TestProvision } from "^jarun";

import { getJarunPromiseClass } from "../_fixture";

export default (prov: TestProvision) => {
  const JarunPromise = getJarunPromiseClass(prov);

  return JarunPromise.reject(new Error("wup"));
};
