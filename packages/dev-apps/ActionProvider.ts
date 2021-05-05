import { WsServerProv } from "^jab-express";

import { ServerMessage } from "^dev-appc";

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
