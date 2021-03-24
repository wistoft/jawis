import { TestProvision } from "^jarun";

import { getEventProvider } from "../_fixture";

export default (prov: TestProvision) => {
  const ep = getEventProvider(prov);

  ep.onTestStarts("test 1");
};
