import { TestProvision } from "^jarun";
import { getBrowserWebSocket } from "^tests/_fixture";

//open twice

export default async (prov: TestProvision) => {
  const socket = getBrowserWebSocket(prov);

  await socket.openWebSocket();
  await socket.closeWebSocket();

  await socket.openWebSocket();
};
