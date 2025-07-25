import { BeeDeps } from "^bee-common";
import { err, OnErrorData, GetUrlToRequire } from "^jab";
import { ymerMainDeclaration } from "^jabrov";
import {
  makeMakeGeneralRouter,
  NodeWS,
  WsMessageListener,
  makeUpgradeHandler,
  MakeUpgradeHandlerDeps,
} from "^jab-express";

import {
  BeeFrostClientMessage,
  BeeFrostServerMessage,
  BuzzStore,
} from "./internal";

type Deps = {
  getUrlToRequire: GetUrlToRequire;
  webCsUrl: string;
  onErrorData: OnErrorData;
} & MakeUpgradeHandlerDeps;

/**
 *  - `makeBrowserBee` can be used to create bee, when the channel is open.
 */
export const makeBrowserBeeFrost = (deps: Deps) => {
  const ymerUrl = deps.getUrlToRequire(ymerMainDeclaration);

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
      webCsUrl: deps.webCsUrl,
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

  const makeJabroRouter = makeMakeGeneralRouter({
    onWsUpgrade: makeUpgradeHandler<
      BeeFrostServerMessage,
      BeeFrostClientMessage
    >(deps, onMessage, onOpen),
  });

  return { makeBrowserBee, makeJabroRouter };
};
