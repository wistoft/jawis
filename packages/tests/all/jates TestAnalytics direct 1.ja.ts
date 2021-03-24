import { TestProvision } from "^jarun";

import { getTestAnalytics } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics(prov);

  prov.eq(undefined, ta.getDirectRequired("1"));

  ta.addDependency("1", "2");

  prov.eq(new Set(["2"]), ta.getDirectRequired("1"));

  ta.addDependency("1", "3");
  ta.addDependency("1", "3");

  prov.eq(new Set(["2", "3"]), ta.getDirectRequired("1"));
};
