import { TestProvision } from "^jarun";

import { getTestAnalytics } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics(prov);

  prov.eq([], ta.getImpact());

  //unknown file is just ignored.

  ta.onChangedFile("a");

  prov.eq([], ta.getImpact());

  // test is added as dirty

  ta.setTests(["1"]);
  prov.eq([["1"]], ta.getImpact());

  //now everything is tested

  ta.setTestValid("1");
  prov.eq([], ta.getImpact());

  // changed test is added at zero'th level

  ta.onChangedFile("1");

  prov.eq([["1"]], ta.getImpact());
  prov.eq([["1"]], ta.getImpact()); //test remains invalid, until set valid.

  // when a test is set valid, it's removed from the impact list

  ta.setTestValid("1");

  prov.eq([], ta.getImpact());
};
