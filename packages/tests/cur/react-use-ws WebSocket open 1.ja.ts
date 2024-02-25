import { TestProvision } from "^jarun";
import { poll } from "^yapu";
import { getBrowserWebSocket } from "^tests/_fixture";

//open twice

export default async (prov: TestProvision) => {
  const socket = getBrowserWebSocket(prov);

  await socket.openWebSocket();

  socket.closeWebSocket();

  await poll(() => socket.state === "closed", 100);

  await socket.openWebSocket();

  socket.closeWebSocket();
};
