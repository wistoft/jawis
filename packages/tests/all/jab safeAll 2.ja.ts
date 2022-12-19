import { TestProvision } from "^jarun";

import { nightmare, safeAll, sleeping } from "^yapu";

export default (prov: TestProvision) => {
  let touched = false;
  const toucher = sleeping(10).then(() => {
    touched = true;
  });

  return safeAll([nightmare(0, "ups"), toucher], () => {}).finally(() => {
    //the toucher hasn't run yet.
    prov.chk(!touched);
  });
};
