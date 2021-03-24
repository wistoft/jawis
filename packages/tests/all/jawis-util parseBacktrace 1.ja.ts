import { TestProvision } from "^jarun";

import { parseBacktrace } from "^jawis-util/web";

export default (prov: TestProvision) => {
  prov.imp(parseBacktrace(undefined));
  prov.imp(parseBacktrace(""));
  prov.imp(parseBacktrace("\n"));
};
