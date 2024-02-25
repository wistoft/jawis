import { TestProvision } from "^jarun";
import { getBrowserWebSocket_connected } from "^tests/_fixture";
import { poll } from "^yapu";

//close in closed state

export default async (prov: TestProvision) => {
  const socket = await getBrowserWebSocket_connected(prov);

  socket.closeWebSocket();

  await poll(() => socket.state === "closed", 100);

  socket.closeWebSocket(); //will throw
};
