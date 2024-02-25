import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";
import { getBrowserWebSocket } from "^tests/_fixture";

//send in reconnecting state

//also tests: close in reconnecting state

export default async (prov: TestProvision) => {
  let first = true;
  const done = getPromise<void>();

  const socket = getBrowserWebSocket(prov, {
    mock: {
      onOpenEmitted: (remoteWs) => {
        if (first) {
          first = false;
          remoteWs.closeRemote();

          prov.eq("reconnecting", socket.state);
          socket.apiSend({ msg: "This will be ignored, and give warning" });

          //Closing in the same tick, as reconnect state was entered, so we know
          // reconnect must not be tried, as it is delayed by some time out.
          socket.closeWebSocket();
          done.resolve();
        }
      },
    },
  });

  await socket.openWebSocket();

  await done.promise;
};
