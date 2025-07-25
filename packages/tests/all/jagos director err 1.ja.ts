import { TestProvision } from "^jarun";

import { getJagosDirector } from "^tests/_fixture";

//unknown message from client.

export default (prov: TestProvision) => {
  getJagosDirector(prov).onClientMessage("blabla" as any);
};
