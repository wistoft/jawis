import { TestProvision } from "^jarun";

import { categorizeImportSpecifier } from "^pack-util/internal";

export default (prov: TestProvision) => {
  prov.catch(() => categorizeImportSpecifier("file:some-file.ts"));
  prov.catch(() => categorizeImportSpecifier("bla:some-file.ts"));
};
