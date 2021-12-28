import { ScriptOutput } from "^jab";
import { WsPoolProv } from "^jab-express";
import { ServerMessage, ScriptStatus, ClientMessage } from "^jagoc";
import { ScriptPoolControllerDeps } from "./ScriptPoolController";

export type ClientComProv = Pick<
  ScriptPoolControllerDeps,
  "sendProcessStatus" | "onControlMessage" | "onScriptOutput"
>;

type Deps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
};

/**
 *
 */
export class ClientComController implements ClientComProv {
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
  public onControlMessage = (script: string, data: string) => {
    this.deps.wsPool.send({
      script,
      type: "control",
      data: data,
    });
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
}
