import { TestProvision } from "^jarun";

import { renderUseJagoDirector } from "^tests/_fixture";

// throws if props change

export default (prov: TestProvision) => {
  const { hook } = renderUseJagoDirector(prov);

  //function are checked by reference, so they have changed.
  hook({
    apiSend: () => {},
    useWsEffect: () => {},
  });
};
