
import { WsPoolProv } from "^jab-express";
import {
  ServerMessage,
  ScriptStatus,
  ScriptOutput,
  ClientMessage,
} from "^jagoc";

export type ActionProv = {
  sendProcessStatus: (status: ScriptStatus[]) => void;
  onScriptOutput: (script: string, output: ScriptOutput) => void;
  onControlMessage: (script: string, data: string) => void;
};

type Deps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
};

/**
 *
 */
export class ActionProvider implements ActionProv {
  constructor(private deps: Deps) {}

  /**
   *
   */
  public sendProcessStatus = (status: ScriptStatus[]) => {
    this.deps.wsPool.send({
      type: "processStatus",
      data: status,
    });
  };

  /**
   *
   */
  public onProcessStatusChange = (status: ScriptStatus[]) => {
    this.sendProcessStatus(status);
  };

  /**
   *
   */
  public onScriptOutput = (script: string, output: ScriptOutput) => {
    this.deps.wsPool.send({
      script,
      ...output,
    });
  };

  /**
   *
   */
  public onControlMessage = (script: string, data: string) => {
    this.deps.wsPool.send({
      script,
      type: "control",
      data: data,
    });
  };
}
