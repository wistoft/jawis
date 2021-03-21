import { TestProvision } from "^jarun";

import { getJarunTestProvision } from "../_fixture";

export default (prov: TestProvision) => {
  const inner = getJarunTestProvision(prov);

  inner.logStream("stream", "hejdav");
  inner.logStream("stream", Buffer.from(" hello"));

  prov.eq({ user: { stream: ["hejdav hello"] } }, inner.logs);
};
