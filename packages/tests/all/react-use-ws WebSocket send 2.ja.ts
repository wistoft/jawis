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

          prov.eq("connected", socket.state);

          remoteWs.closeRemote();
          prov.eq("reconnecting-waiting", socket.state);

          socket.apiSend({ msg: "This will be ignored, and give warning" });

          //Closing in the same tick, as reconnect state was entered, so we know
          // reconnect hasn't started yet. As it is delayed by some time out.
          socket.closeWebSocket().then(done.resolve);
        } else {
          throw new Error("Must not try to reconnect, after close is called.");
        }
      },
    },
  });

  await socket.openWebSocket();

  await done.promise;
};
