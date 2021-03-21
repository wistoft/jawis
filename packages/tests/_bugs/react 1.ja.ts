import { useWebSocketProv } from "^jab-react";
import { TestProvision } from "^jarun";

// error message is terrible, it can be filtered.

export default (prov: TestProvision) => {
  useWebSocketProv({ URL: "dummy", reconnect: true });
};
