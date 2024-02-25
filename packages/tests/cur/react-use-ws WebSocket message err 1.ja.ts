import { TestProvision } from "^jarun";
import { getBrowserWebSocket_connected } from "^tests/_fixture";

//message in closing state

export default async (prov: TestProvision) => {
  const socket = await getBrowserWebSocket_connected(prov, {
    onServerMesssage: (msg) => {
      console.log(msg)
    },
    mock: {
      onClose: (remoteWs) => {
        remoteWs.sendBack({ type: "Are you in closing state?" });
      },
    },
  });

  return socket.closeWebSocket();
};
