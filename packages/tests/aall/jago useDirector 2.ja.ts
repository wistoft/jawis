import { TestProvision } from "^jarun";

import { renderUseJagoDirector } from "^tests/_fixture";
import { def } from "^jab";

// onOpen sends a message to server

export default (prov: TestProvision) => {
  const { onOpen } = renderUseJagoDirector(prov);

  def(onOpen)();
};
