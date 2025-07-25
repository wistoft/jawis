import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";
import { getBrowserWebSocket } from "^tests/_fixture";

//server closes in connecting state

export default async (prov: TestProvision) => {
  const socket = getBrowserWebSocket(prov, {
    reconnect: false,
    mock: {
      onOpen: (remoteWs) => {
        prov.eq("connecting", socket.state);

        remoteWs.rejectOpen(new Error("Server refuses"));
      },
    },
  });

  await socket.openWebSocket();
};
