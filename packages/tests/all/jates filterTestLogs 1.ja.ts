import { TestProvision } from "^jarun";

import { errorData0, filterTestLogs } from "../_fixture";

export default (prov: TestProvision) => {
  prov.eq({ user: {} }, filterTestLogs({ user: {} }));

  //error log is filtered

  prov.imp(filterTestLogs({ err: [errorData0], user: {} }));

  //chk log is filtered

  prov.imp(
    filterTestLogs({
      chk: { cur: 1, exp: 2, stack: errorData0.stack },
      user: {},
    })
  );

  //user log isn't filtered

  prov.imp(filterTestLogs({ user: { imp: [errorData0 as any] } }));
};
