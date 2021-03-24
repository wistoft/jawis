import { TestProvision } from "^jarun";

import { getTestAnalytics } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics(prov);

  // test with dependency

  ta.setTests(["1"]);
  ta.addDependency("1", "a");

  // test is added as dirty

  prov.eq([["1"]], ta.getImpact());

  //now everything is tested

  ta.setTestValid("1");
  prov.eq([], ta.getImpact());

  // when file change, the test is impacted.

  ta.onChangedFile("a");

  prov.eq([[], ["1"]], ta.getImpact());

  // when test change it is promoted a level.

  ta.onChangedFile("1");

  prov.eq([["1"]], ta.getImpact());

  //a file change, doesn't increase level

  ta.onChangedFile("a");
  prov.eq([["1"]], ta.getImpact());

  // when a test is set valid, and it's impacted by file change, its level increases.

  ta.setTestValid("1");
  ta.onChangedFile("a");

  prov.eq([[], ["1"]], ta.getImpact());
};
