import { TestProvision } from "^jarun";
import { getBrowserWebSocket_connected } from "^tests/_fixture";

//message in closing state is fully ignored.

export default async (prov: TestProvision) => {
  const socket = await getBrowserWebSocket_connected(prov, {
    onServerMessage: () => {
      throw new Error("unreach");
    },
    mock: {
      onClose: (remoteWs) => {
        remoteWs.sendBack({ type: "Are you in clo sing state?" });
      },
    },
  });

  return socket.closeWebSocket();
};
