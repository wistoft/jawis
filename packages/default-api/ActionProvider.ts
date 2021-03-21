import { WsServerProv } from "^jab-express";

import { ServerMessage } from "^default-common";

export type ActionProv = {
  onPingAll: () => void;
};

type Deps = {
  wsService: WsServerProv<ServerMessage>;
};

/**
 *
 */
export class ActionProvider implements ActionProv {
  constructor(private deps: Deps) {}

  /**
   *
   */
  public onPingAll = () => {
    this.deps.wsService.send({
      type: "ping all",
    });
  };
}
