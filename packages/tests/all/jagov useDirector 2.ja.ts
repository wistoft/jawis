import { TestProvision } from "^jarun";

import { def } from "^jab";
import { renderUseJagoDirector } from "^tests/_fixture";

// onOpen sends a message to server

export default (prov: TestProvision) => {
  const { onOpen } = renderUseJagoDirector(prov);

  def(onOpen)();
};
