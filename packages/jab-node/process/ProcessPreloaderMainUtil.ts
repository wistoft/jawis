import { assertNever } from "^jab";

import { nodeRequire, registerRejectionHandlers } from "..";

import {
  makeSend,
  registerOnMessage,
  removeOnMessage,
  BooterMessage,
  PreloaderMessage,
} from ".";

/**
 *
 */
export const ppMain = () => {
  //quick fix - should be optional

  registerRejectionHandlers();

  //worker or process

  const send = makeSend<BooterMessage | { type: "script-required" }>();

  //more

  const onMessage = (msg: PreloaderMessage) => {
    switch (msg.type) {
      case "startScript":
        //We remove here, because otherwise we'll block the process from exiting.

        removeOnMessage(onMessage);

        //start the script

        nodeRequire(msg.script);

        //signal

        send({ type: "script-required" });

        break;

      default:
        throw assertNever(msg.type);
    }
  };

  //setup listener

  registerOnMessage(onMessage);

  send({ type: "ready" });
};
