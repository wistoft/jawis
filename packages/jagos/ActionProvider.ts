import crypto from "crypto";

import { WsPoolProv } from "^jab-express";
import {
  ServerMessage,
  ScriptStatusTypes,
  ScriptStatus,
  ScriptOutput,
  ClientMessage,
} from "^jagoc";
import { err } from "^jab";

export type ActionProv = {
  sendProcessStatus: () => void;
  onProcessStatusChange: (script: string, status: ScriptStatusTypes) => void;
  onScriptOutput: (script: string, output: ScriptOutput) => void;
  onControlMessage: (script: string, data: string) => void;
};

type Deps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
  scripts: string[];
};

/**
 *
 */
export class ActionProvider implements ActionProv {
  private allProcStatus: ScriptStatus[];

  constructor(private deps: Deps) {
    this.allProcStatus = [];

    this.deps.scripts.forEach((script) => {
      this.allProcStatus.push({
        id: crypto.createHash("md5").update(script).digest("hex"),
        script,
        status: "stopped",
      });
    });
  }

  /**
   * used by behavior
   *
   */
  public sendProcessStatus = () => {
    this.deps.wsPool.send({
      type: "processStatus",
      data: this.allProcStatus,
    });
  };

  /**
   *
   */
  public onProcessStatusChange = (
    script: string,
    status: ScriptStatusTypes
  ) => {
    const index = this.allProcStatus.findIndex((x) => x.script === script);

    if (index === -1) {
      throw err("script not found in state: ", script);
    }

    this.allProcStatus[index].status = status;

    this.sendProcessStatus();
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
