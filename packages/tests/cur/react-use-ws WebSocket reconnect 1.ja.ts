import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";
import { getBrowserWebSocket } from "^tests/_fixture";

//reconnect when server closes connection

export default async (prov: TestProvision) => {
  let first = true;
  const reconnected = getPromise<void>();

  const socket = getBrowserWebSocket(prov, {
    mock: {
      onOpenEmitted: (remoteWs) => {
        if (first) {
          first = false;
          remoteWs.closeRemote();
          prov.eq("reconnecting", socket.state);
        } else {
          reconnected.resolve();
        }
      },
    },
  });

  await socket.openWebSocket();

  await reconnected.promise;

  prov.eq("connected", socket.state);

  socket.closeWebSocket();
};
