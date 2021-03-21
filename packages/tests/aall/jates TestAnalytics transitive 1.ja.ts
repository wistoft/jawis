import { TestProvision } from "^jarun";

import { getTestAnalytics } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics(prov);

  prov.eq(new Set(), ta.getTransitiveRequired("1"));

  ta.addDependency("1", "2");

  prov.eq(new Set(["2"]), ta.getTransitiveRequired("1"));

  ta.addDependency("2", "3");

  prov.eq(new Set(["2", "3"]), ta.getTransitiveRequired("1"));

  //cycle

  ta.addDependency("3", "1");

  prov.eq(new Set(["1", "2", "3"]), ta.getTransitiveRequired("1"));
  prov.eq(new Set(["1", "2", "3"]), ta.getTransitiveRequired("3"));
};
