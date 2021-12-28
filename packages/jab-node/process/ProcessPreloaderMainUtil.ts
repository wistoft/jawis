import { assertNever, makeSend } from "^jab";

import {
  registerOnMessage_old,
  removeOnMessage,
  BooterMessage,
  PreloaderMessage,
} from ".";

/**
 *
 */
export const ppMain = () => {
  //worker or process

  const send = makeSend<BooterMessage | { type: "script-required" }>();

  //more

  const onMessage = (msg: PreloaderMessage) => {
    switch (msg.type) {
      case "startScript":
        //We remove here, because otherwise we'll block the process from exiting.

        removeOnMessage(onMessage);

        //start the script

        eval("require.eager || require")(msg.script);

        //signal

        send({ type: "script-required" });

        break;

      default:
        throw assertNever(msg.type);
    }
  };

  //setup listener

  registerOnMessage_old(onMessage);

  send({ type: "ready" });
};
