import { TestProvision } from "^jarun";
import { getBrowserWebSocket_connected } from "^tests/_fixture";

//close in open state

export default async (prov: TestProvision) => {
  const socket = await getBrowserWebSocket_connected(prov);

  return socket.closeWebSocket();
};
