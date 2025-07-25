import { TestProvision } from "^jarun";
import { getBrowserWebSocket } from "^tests/_fixture";

//close in connecting state

export default async (prov: TestProvision) => {
  const socket = getBrowserWebSocket(prov);

  socket.openWebSocket();

  return socket.closeWebSocket();
};
