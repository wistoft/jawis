import { TestProvision } from "^jarun";
import { getBrowserWebSocket } from "^tests/_fixture";

//close before open is called

export default async (prov: TestProvision) => {
  const socket = getBrowserWebSocket(prov);

  return socket.closeWebSocket();
};
