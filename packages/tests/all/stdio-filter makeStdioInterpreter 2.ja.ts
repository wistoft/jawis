import { TestProvision } from "^jarun";

import { makeStdioInterpreter_for_test } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const parser = makeStdioInterpreter_for_test(prov);

  parser("hej");
  parser("dav");
  parser("\n");
  parser("igen");
  parser("\nhej\n");
};
