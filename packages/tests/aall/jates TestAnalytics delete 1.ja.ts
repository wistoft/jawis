import { TestProvision } from "^jarun";

import { getTestAnalytics } from "../_fixture";

export default (prov: TestProvision) => {
  const ta = getTestAnalytics(prov, "path/to/test");

  ta.setTests(["1"]);

  prov.eq([["1"]], ta.getImpact());

  ta.onDeletedFile("path\\to\\test\\1");
  ta.setTests([]);

  prov.eq([], ta.getImpact());
};
