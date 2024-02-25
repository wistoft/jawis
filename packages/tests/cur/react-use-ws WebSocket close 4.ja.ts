import { TestProvision } from "^jarun";
import { getBrowserWebSocket_connected } from "^tests/_fixture";

//close in closing state

export default async (prov: TestProvision) => {
  const socket = await getBrowserWebSocket_connected(prov);

  socket.closeWebSocket();

  socket.closeWebSocket(); //will not throw
};
