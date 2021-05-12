import { TestProvision } from "^jarun";

import { safeCloneInfo } from "^jab";

//JabError handles exceptions during clone.

export default (prov: TestProvision) => {
  prov.imp(safeCloneInfo("original error message", undefined as any));
};
