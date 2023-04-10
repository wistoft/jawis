import { WsPoolProv, SocketData, NodeWS, makeApp } from "^jab-express";

import { TestProvision } from "^jarun";
import { getServer, getServerDeps } from "./jab Server";
import {
  TestMainProv,
  getFixturePath,
  getMainProv,
  getScriptPath,
} from "./diverse";

export type Deps<MS extends SocketData> = {
  log: TestProvision["log"];
  filterMessage?: (data: MS) => MS;
};

/**
 *
 */
export class WsPoolMock<MS extends SocketData, MR extends SocketData>
  implements WsPoolProv<MS, MR>
{
  constructor(private deps: Deps<MS>) {}

  public send = (data: MS) => {
    const filtered = this.deps.filterMessage
      ? this.deps.filterMessage(data)
      : data;
    this.deps.log("WsPoolMock.send", filtered);
  };

  //should this call the callbacks
  public forAll = (cb: (client: NodeWS<MS, MR>) => void) => {
    this.deps.log("WsPoolMock.forAll", cb);
  };

  //it's okay to make the upgrade handler, throws if a test case tries to make a web socket upgrade.
  public makeUpgradeHandler = () => () => {
    throw new Error("ws upgradeHandler not implemented for tests");
  };

  public shutdown = () => Promise.resolve();
}

/**
 *
 */
export const makeApp_no_routes = (prov: TestProvision) => {
  const app = makeApp({
    staticWebFolder: getScriptPath(),
    mainProv: getMainProv(prov),
    makeRoutes: [],
    clientConf: {
      variable: "__JAVI_CLIENT_CONF",
      value: { var1: "hello" },
    },
    indexHtml: "index html content",
  });

  return getServer(
    prov,
    getServerDeps(prov, undefined, {
      app,
    })
  );
};
