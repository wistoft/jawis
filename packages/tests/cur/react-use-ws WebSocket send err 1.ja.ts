import { TestProvision } from "^jarun";
import { getBrowserWebSocket_connected } from "^tests/_fixture";

//send in closing state

export default async (prov: TestProvision) => {
  const socket = await getBrowserWebSocket_connected(prov);

  const p = socket.closeWebSocket();

  prov.eq("connected", socket.state);

  socket.apiSend({ msg: "I shouldn't do this." });

  return p;
};
