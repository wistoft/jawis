import { WsPoolProv , SocketData, NodeWS } from "^jab-express";


import { TestProvision } from "^jarun";

/**
 *
 */
export class WsPoolMock<MS extends SocketData, MR extends SocketData>
  implements WsPoolProv<MS, MR> {
  constructor(private prov: TestProvision) {}

  public send = (data: MS) => {
    this.prov.log("WsPoolMock.send", data);
  };

  public forAll = (cb: (client: NodeWS<MS, MR>) => void) => {
    this.prov.log("WsPoolMock.forAll", cb);
  };

  //it's okay to make the upgrade handler, throws if a test case tries to make a web socket upgrade.
  public makeUpgradeHandler = () => () => {
    throw new Error("ws upgradeHandler not implemented for tests");
  };

  public shutdown = () => Promise.resolve();
}
