import { TestProvision } from "^jarun";

import { nightmare, safeAllWait, sleeping } from "^yapu";

export default (prov: TestProvision) => {
  //this will never resolve.
  safeAllWait([nightmare(0, "ups"), new Promise(() => {})], prov.onError);

  return sleeping(10);
};
