import { BeeDeps } from "^bee-common";
import { err } from "^jab";
import {
  NodeWS,
  WsMessageListener,
  makeUpgradeHandler,
  MakeUpgradeHandlerDeps,
  makeGeneralRouter,
} from "^jab-express";

import {
  BeeFrostClientMessage,
  BeeFrostServerMessage,
  BuzzStore,
} from "./internal";

type Deps = {
  scriptsUrl: string;
} & MakeUpgradeHandlerDeps;

/**
 *  - `makeBrowserBee` can be used to create bee, when the channel is open.
 */
export const makeBrowserBeeFrost = (deps: Deps) => {
  const ymerUrl = "http://localhost:3000/ymer.js"; //todo: switch between dev and prod

  const store = new BuzzStore(deps);

  const map: Map<any, (msg: BeeFrostClientMessage) => void> = new Map();

  /**
   *
   */
  const makeBrowserBee = <MR extends {}>(beeDeps: BeeDeps<MR>) => {
    //
    const makeBee = store.tryGetOne();

    if (makeBee === undefined) {
      throw err("Has no places to run browser bees.");
    }

    //make

    return makeBee(beeDeps);
  };

  const onOpen = (
    nws: NodeWS<BeeFrostServerMessage, BeeFrostClientMessage>
  ) => {
    const { unregister, onMessage } = store.register(nws);

    map.set(nws, onMessage);

    // send configuration

    nws.send({
      type: "setConf",
      ymerUrl,
      scriptsUrl: deps.scriptsUrl,
    });

    //ensure unregister on web socket close

    (nws as any).ws.on("close", unregister);
  };

  const onMessage: WsMessageListener<
    BeeFrostServerMessage,
    BeeFrostClientMessage
  > = (msg, nws) => {
    const onMessage = map.get(nws);

    if (!onMessage) {
      throw new Error("Don't know the web socket this message comes from.");
    }

    onMessage(msg);
  };

  const makeJabroRouter = () =>
    makeGeneralRouter({
      onWsUpgrade: makeUpgradeHandler<
        BeeFrostServerMessage,
        BeeFrostClientMessage
      >(deps, onMessage, onOpen),
    });

  return { makeBrowserBee, makeJabroRouter };
};
