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
        try {
          if (first) {
            // server closes first connecting
            first = false;

            //socket has received open-event and gone into connected-state.
            prov.eq("connected", socket.state);

            remoteWs.closeRemote();
            prov.eq("reconnecting-waiting", socket.state);
          } else {
            // reconnecting without an error
            reconnected.resolve();
          }
        } catch (error: any) {
          //to avoid tests block is case of failure
          reconnected.reject(error);
        }
      },
    },
  });

  await socket.openWebSocket();

  await reconnected.promise;

  prov.eq("connected", socket.state);

  await socket.closeWebSocket();
};
