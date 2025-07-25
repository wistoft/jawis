import { assertNever, MainFileDeclaration } from "^jab";

import {
  BooterMessage,
  PreloaderMessage,
  BeeMain,
  unsetGlobalBeeProv,
} from "./internal";

export const getBeePreloaderMainDeclaration = (): MainFileDeclaration => ({
  type: "pure-bee",
  file: "BeePreloaderMain",
  folder: __dirname,
});

/**
 *
 */
export const main: BeeMain<BooterMessage | { type: "script-required" }> = (
  prov
) => {
  const onMessage = (msg: PreloaderMessage) => {
    switch (msg.type) {
      case "startScript":
        //We remove here, because otherwise we'll block the bee from exiting.

        prov.removeOnMessage(onMessage);

        //relinquish the global-prov set for this bee.

        unsetGlobalBeeProv();

        //start the script

        prov.runBee(msg.def, true).then(() => {
          prov.beeSend({ type: "script-required" });
        });

        break;

      default:
        assertNever(msg.type);
    }
  };

  //setup listener

  prov.registerOnMessage(onMessage);

  prov.beeSend({ type: "ready" });
};
