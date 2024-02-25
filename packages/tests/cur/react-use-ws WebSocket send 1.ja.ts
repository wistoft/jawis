import { TestProvision } from "^jarun";
import { getBrowserWebSocket } from "^tests/_fixture";

//send in connecting state

export default async (prov: TestProvision) => {
  const socket = getBrowserWebSocket(prov);

  const p = socket.openWebSocket();

  prov.eq("closed", socket.state);

  socket.apiSend({ msg: "This will be ignored, and give warning" });

  await p;

  return socket.closeWebSocket();
};
