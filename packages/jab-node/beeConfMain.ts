import { makeJagoSend, makeSend, BeeMain } from "^jab";

import { makeJagoOnError_old, registerErrorHandlers } from "^jab-node";

/**
 *
 */
export const main: BeeMain = () => {
  //register rejection handlers

  registerErrorHandlers(
    makeJagoOnError_old(makeJagoSend(makeSend()), /* exitOnError */ true)
  );

  // registerErrorHandlers(makeJagoOnError(makeJagoSend(makeSend())));

  //long traces

  // enable(async_hooks);
};
